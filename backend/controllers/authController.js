const bcrypt = require('bcryptjs');
const { Utilisateur, Restaurant, Livraison } = require('../models/index');
const { generateToken } = require('../utils/generateToken');

// ─── INSCRIPTION ────────────────────────────────────────────────────────────
const sInscrire = async (req, res) => {
  try {
    const { nom, email, telephone, motDePasse, role, vehicule } = req.body;

    // Vérifier que tous les champs obligatoires sont présents
    if (!nom || !email || !telephone || !motDePasse) {
      return res.status(400).json({
        message: 'Tous les champs sont obligatoires.'
      });
    }

    // Vérifier que l'email n'est pas déjà utilisé
    const emailExistant = await Utilisateur.findOne({ where: { email } });
    if (emailExistant) {
      return res.status(409).json({
        message: 'Cet email est déjà associé à un compte.'
      });
    }

    // Hasher le mot de passe avant de le stocker
    const motDePasseHashe = await bcrypt.hash(motDePasse, 12);

    // Créer l'utilisateur
    const nouvelUtilisateur = await Utilisateur.create({
      nom,
      email,
      telephone,
      motDePasse: motDePasseHashe,
      role: role || 'client',
      vehicule: role === 'livreur' ? vehicule : null,
      // les restaurateurs et livreurs attendent une validation admin
      statut: ['restaurateur', 'livreur'].includes(role) ? 'en_attente' : 'actif'
    });

    // Générer le token JWT
    const token = generateToken(nouvelUtilisateur);

    res.status(201).json({
      message: 'Compte créé avec succès.',
      token,
      utilisateur: {
        id:         nouvelUtilisateur.id,
        nom:        nouvelUtilisateur.nom,
        email:      nouvelUtilisateur.email,
        telephone:  nouvelUtilisateur.telephone,
        role:       nouvelUtilisateur.role,
        statut:     nouvelUtilisateur.statut,
        disponible: nouvelUtilisateur.disponible
      }
    });

  } catch (error) {
    console.error('❌ Erreur inscription :', error.message);
    res.status(500).json({ message: 'Erreur lors de la création du compte.' });
  }
};

// ─── CONNEXION ──────────────────────────────────────────────────────────────
const seConnecter = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        message: 'Email et mot de passe requis.'
      });
    }

    // Chercher l'utilisateur par email
    const utilisateur = await Utilisateur.findOne({
      where: { email },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'nom', 'statut'],
          required: false
        }
      ]
    });

    if (!utilisateur) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // Vérifier le statut du compte
    if (utilisateur.statut === 'suspendu') {
      return res.status(403).json({
        message: 'Votre compte a été suspendu. Contactez l\'administrateur.'
      });
    }

    if (utilisateur.statut === 'en_attente') {
      return res.status(403).json({
        message: 'Votre compte est en attente de validation par l\'administrateur.'
      });
    }

    // Vérifier le mot de passe
    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!motDePasseValide) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect.'
      });
    }

    // Générer le token
    const token = generateToken(utilisateur);

    res.json({
      message: 'Connexion réussie.',
      token,
      utilisateur: {
        id:         utilisateur.id,
        nom:        utilisateur.nom,
        email:      utilisateur.email,
        telephone:  utilisateur.telephone,
        role:       utilisateur.role,
        photo:      utilisateur.photo,
        disponible: utilisateur.disponible,
        restaurant: utilisateur.restaurant || null
      }
    });

  } catch (error) {
    console.error('❌ Erreur connexion :', error.message);
    res.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
};

// ─── PROFIL CONNECTÉ ────────────────────────────────────────────────────────
const monProfil = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id, {
      attributes: { exclude: ['motDePasse'] },
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          required: false
        }
      ]
    });

    res.json({ 
      utilisateur: {
        ...utilisateur.toJSON(),
        disponible: utilisateur.disponible
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du profil.' });
  }
};

// ─── MODIFIER PROFIL ────────────────────────────────────────────────────────
const modifierProfil = async (req, res) => {
  try {
    const { nom, telephone, vehicule, disponible } = req.body;
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id);

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const donneesMAJ = {};
    if (nom !== undefined) donneesMAJ.nom = nom;
    if (telephone !== undefined) donneesMAJ.telephone = telephone;

    if (utilisateur.role === 'livreur') {
      if (vehicule !== undefined) donneesMAJ.vehicule = vehicule;

      if (disponible !== undefined) {
        // Un livreur ne peut pas se marquer disponible s'il a deja une mission active.
        if (disponible === true) {
          const missionActive = await Livraison.findOne({
            where: {
              livreurId: utilisateur.id,
              statut: ['acceptee', 'recuperee']
            }
          });

          if (missionActive) {
            return res.status(400).json({
              message: 'Impossible de passer disponible avec une mission en cours.'
            });
          }
        }
        donneesMAJ.disponible = disponible;
      }
    }

    await utilisateur.update(donneesMAJ);

    res.json({ message: 'Profil mis à jour avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
  }
};

// ─── CHANGER MOT DE PASSE ───────────────────────────────────────────────────
const changerMotDePasse = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id);
    const valide = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasse);

    if (!valide) {
      return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });
    }

    const nouveauHash = await bcrypt.hash(nouveauMotDePasse, 12);
    await utilisateur.update({ motDePasse: nouveauHash });

    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du changement de mot de passe.' });
  }
};

module.exports = {
  sInscrire,
  seConnecter,
  monProfil,
  modifierProfil,
  changerMotDePasse
};











