//----------------------------------------GESTION DES POSTS---------------------------------------

const postModel = require("../models/post.model");
const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const { uploadErrors } = require("../utils/errors.utils");
const ObjectID = require("mongoose").Types.ObjectId;
const fs = require("fs");
const sharp = require("sharp");

//---Renvoi de la data ds BDD---
module.exports.readPost = (req, res) => {
  PostModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Error to get data : " + err);
  }).sort({ createdAt: -1 });//---Trier les posts les plus récents en haut (du + récent au + ancien)---
};

//---Créer des Posts---
module.exports.createPost = async (req, res) => {
  let fileName;

  //---Gestion des images---
  if (req.file ) {
    try {
      if (
        req.file.mimetype != "image/jpg" &&
        req.file.mimetype != "image/png" &&
        req.file.mimetype != "image/jpeg" &&
        req.file.mimetype != "image/gif" &&
        req.file.mimetype != "image/webp"
      )
        throw Error("invalid file");

      if (req.file.size > 500000) throw Error("max size");
    } catch (err) {
      const errors = uploadErrors(err);
      return res.status(201).json({ errors });
    }
    fileName = req.body.posterId + Date.now() + ".jpg";

    await sharp(req.file.buffer)
      .toFile(`${__dirname}/../frontend/public/uploads/posts/${fileName}`
      );
  }

    const newPost = new postModel({//---Incrémente le post model---
    posterId: req.body.posterId,
    message: req.body.message,
    //---Incrémente le chemin des images ds la BDD---
    picture: req.file !== null ? "./uploads/posts/" + fileName : "",
    video: req.body.video,//url de la video
    likers: [],
    comments: [],
  });

  try {//---Incrémenter notre data dans la BDD---
    const post = await newPost.save();
    return res.status(201).json(post);//retourne le msg posté
  } catch (err) {
    return res.status(400).send(err);
  }
};

//--Mise à jour du Post---
module.exports.updatePost = (req, res, next) => {

    const postObject = req.file ? {
        ...req.body,
        imageUrl: `${req.file.filename}`
    } : { ...req.body };

    PostModel.findOne({ _id: req.params.id})
        .then((post) => {
            if (post.posterId === req.auth || req.admin === true) {
                PostModel.findOneAndUpdate({ _id: req.params.id}, { ...postObject, _id: req.params.id})
                .then(() => {res.status(200).json({message: "Post modifié !"})})
                .catch(error => {res.status(400).json({ error })});
            } else {
                { res.status(403).json({message: "Vous n'êtes pas authorisé à modifier ce post!"})}
            }
        })
        .catch(error => {res.status(400).json({ error })});
    }

//---Suppression de Posts---
module.exports.deletePost = (req, res, next) => {
    
    PostModel.findOne({ _id: req.params.id})
        .then((post) => {
            if (post.posterId === req.auth || req.admin === true) {
            PostModel.findOneAndDelete({ _id: req.params.id })
                .then(() => { res.status(200).json({message: "Post supprimé !"})})
                .catch(error => res.status(401).json({ error }))
            } else {
                { res.status(403).json({message: "Vous n'êtes pas authorisé à modifier ce post!"})}
            }
        })
        .catch(error => res.status(500).json({ error }));
};

//---Likes---
module.exports.likePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await PostModel.findOneAndUpdate(//---Récupère le msg & son id--
      {_id: req.params.id},
      {
        $addToSet: { likers: req.body.id },//---addTSet : ajoute 1 donnée en + au tableau likers
      },
      { new: true })
      .then((data) => res.send(data))
      .catch((err) => res.status(500).send({ message: err }));

    await UserModel.findOneAndUpdate(
      req.body.id,
      {
        $addToSet: { likes: req.params.id },
      },
      { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
      if(res.headersSent !== true)//error
        return res.status(400).send(err);
    }
};

//---Unlikes---
module.exports.unlikePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await PostModel.findOneAndUpdate(
      {_id: req.params.id},
      {
        $pull: { likers: req.body.id },//----pull : Retire du tableau des likes---
      },
      { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));

    await UserModel.findOneAndUpdate(
      req.body.id,
      {
        $pull: { likes: req.params.id },
      },
      { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
      if(res.headersSent !== true)//error
        return res.status(400).send(err);
    }
};

//---Commentaires des Posts---
module.exports.commentPost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const data = await PostModel.findOneAndUpdate(
      {_id: req.params.id},
      {
        $push: {//---Push du tableau "comments" + ajoute un new comment (objet) à la BDD---
          comments: {//---Récuperation de la data du comment----
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(),//---Incrémenter un timestamp pr recuperer la date du comment---
          },
        },
      })
            return res.status(200).send(data)
      } catch (err) {
        return res.status(400).send(err);
    }
};

//---Editer Commentaire sur Posts---
module.exports.editCommentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    return PostModel.findById(req.params.id, (err, docs) => {
      const theComment = docs.comments.find((comment) =>
        comment._id.equals(req.body.commentId)
      );

      if (!theComment) return res.status(404).send("Comment not found");
      theComment.text = req.body.text;

      return docs.save((err) => {
        if (!err) return res.status(200).send(docs);
        return res.status(500).send(err);
      });
    });
  } catch (err) {
    return res.status(400).send(err);
  }
};

//---Suppression Commentaires des Posts---
module.exports.deleteCommentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

        if (req.params.id === res.auth || res.admin === true) {
          PostModel.findOneAndUpdate(
            {_id: req.params.id},
            {
              $pull: {
                comments: {
                  _id: req.body.commentId,
                },
              },
            })
            .then(() => {res.status(200).json({message : "Commentaire supprimé"})})
            .catch((err) => res.status(500).send({ message: err }));
    
          } else {
            return res.status(403).json({ message: "Vous n'êtes pas authorisé à supprimer ce commentaire!"});
          }
        };
