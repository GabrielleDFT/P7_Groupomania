const router = require('express').Router();
//--Controller
const postController = require('../controllers/post.controller');

const multer = require("multer");
const upload = multer();

//--Routes Posts--
router.get('/', postController.readPost);
router.post('/', upload.single("file"), postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

//--Routes Likes & Unlikes
router.patch('/like-post/:id', postController.likePost);
router.patch('/unlike-post/:id', postController.unlikePost);

//--Routes Commentaires--
router.patch('/comment-post/:id', postController.commentPost);
router.patch('/edit-comment-post/:id', postController.editCommentPost);
router.patch('/delete-comment-post/:id', postController.deleteCommentPost);

module.exports = router;
