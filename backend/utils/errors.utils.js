//----------------------------------------GESTION DES ERREURS--------------------------------------------------

//---SignUp Errors---
module.exports.signUpErrors = (err) => {
  let errors = { pseudo: "", email: "", password: "" };

  if (err.message.includes("pseudo"))
    errors.pseudo = "Pseudo incorrect ou déjà pris";

  if (err.message.includes("email")) errors.email = "Email incorrect";

  if (err.message.includes("password"))
    errors.password = "Le mot de passe doit faire 6 caractères minimum";

  if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("pseudo"))
    errors.pseudo = "Ce pseudo est déjà utilisé !";

  if (err.code === 11000 && Object.keys(err.keyValue)[0].includes("email"))
    errors.email = "Cet email est déjà utilisé !";

  return errors;
};

//---SignIn Errors---
module.exports.signInErrors = (err) => {
  let errors = { email: '', password: ''}

  if (err.message.includes("email")) 
    errors.email = "Email inconnu";
  
  if (err.message.includes('password'))
    errors.password = "Le mot de passe ne correspond pas"

  return errors;
}

//---Upload Size Errors---
module.exports.uploadErrors = (err) => {
  let errors = { format: '', maxSize: ""};

  if (err.message.includes('invalid file'))
    errors.format = "Format incompatible";

  if (err.message.includes('max size'))
    errors.maxSize = "Le fichier dépasse 500ko";

  return errors
}
