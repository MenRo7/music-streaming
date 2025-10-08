import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LegalPages.css';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Politique de Confidentialité</h1>
        <p className="last-updated">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <section>
          <h2>1. Identité du Responsable du Traitement</h2>
          <p>
            <strong>Rhapsody</strong> ("nous", "notre", "nos") est le responsable du traitement de vos données personnelles.
          </p>
          <p>
            <strong>Contact :</strong> privacy@rhapsody.com
          </p>
        </section>

        <section>
          <h2>2. Données Collectées</h2>
          <p>Nous collectons les catégories de données personnelles suivantes :</p>

          <h3>2.1 Données d'inscription</h3>
          <ul>
            <li><strong>Nom</strong> : pour personnaliser votre profil</li>
            <li><strong>Adresse e-mail</strong> : pour l'authentification et les communications</li>
            <li><strong>Mot de passe</strong> : hashé avec bcrypt pour la sécurité</li>
            <li><strong>Date de naissance</strong> : pour vérifier l'âge minimum (18 ans pour les fonctionnalités de donation)</li>
          </ul>

          <h3>2.2 Données de profil</h3>
          <ul>
            <li><strong>Image de profil</strong> (optionnelle)</li>
            <li><strong>Préférences linguistiques</strong></li>
          </ul>

          <h3>2.3 Contenu utilisateur</h3>
          <ul>
            <li>Fichiers musicaux téléversés</li>
            <li>Albums créés</li>
            <li>Playlists créées</li>
            <li>Images de couverture d'albums</li>
            <li>Favoris et likes</li>
          </ul>

          <h3>2.4 Données d'interaction sociale</h3>
          <ul>
            <li>Abonnements à d'autres utilisateurs</li>
            <li>Abonnés</li>
            <li>Historique de likes (albums, playlists)</li>
          </ul>

          <h3>2.5 Données de paiement</h3>
          <ul>
            <li><strong>Stripe Connect ID</strong> : pour les utilisateurs recevant des donations</li>
            <li><strong>Historique des donations</strong> : montants, dates, bénéficiaires</li>
            <li>Note : Les informations de carte bancaire sont traitées directement par Stripe, nous ne les stockons jamais</li>
          </ul>

          <h3>2.6 Données techniques</h3>
          <ul>
            <li>Adresse IP (dans les sessions)</li>
            <li>User-Agent du navigateur</li>
            <li>Tokens d'authentification</li>
            <li>Codes de vérification temporaires (email, 2FA, réinitialisation de mot de passe)</li>
          </ul>
        </section>

        <section>
          <h2>3. Base Légale et Finalités du Traitement</h2>

          <h3>3.1 Exécution du contrat (Article 6(1)(b) RGPD)</h3>
          <ul>
            <li>Création et gestion de votre compte</li>
            <li>Fourniture des services de streaming musical</li>
            <li>Gestion des playlists et albums</li>
            <li>Interactions sociales (abonnements, likes)</li>
          </ul>

          <h3>3.2 Consentement (Article 6(1)(a) RGPD)</h3>
          <ul>
            <li>Acceptation des conditions générales</li>
            <li>Utilisation de cookies non essentiels</li>
            <li>Communications marketing (si activées)</li>
          </ul>

          <h3>3.3 Obligations légales (Article 6(1)(c) RGPD)</h3>
          <ul>
            <li>Vérification de l'âge minimum</li>
            <li>Conservation des transactions financières</li>
            <li>Réponse aux demandes des autorités</li>
          </ul>

          <h3>3.4 Intérêts légitimes (Article 6(1)(f) RGPD)</h3>
          <ul>
            <li>Sécurité de la plateforme (rate limiting, détection de fraude)</li>
            <li>Amélioration de nos services</li>
            <li>Support technique</li>
          </ul>
        </section>

        <section>
          <h2>4. Partage des Données avec des Tiers</h2>

          <h3>4.1 Stripe</h3>
          <p>
            Pour le traitement des paiements et des donations, nous partageons votre adresse e-mail et
            les montants de donation avec <strong>Stripe Inc.</strong>
          </p>
          <p>
            Stripe agit comme sous-traitant conformément à leur
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer"> politique de confidentialité</a>.
          </p>

          <h3>4.2 Fournisseur d'e-mails</h3>
          <p>
            Nous utilisons un service SMTP pour l'envoi d'e-mails transactionnels (vérification, 2FA,
            réinitialisation de mot de passe). Ces e-mails contiennent uniquement votre adresse e-mail et nom.
          </p>

          <h3>4.3 Aucune vente de données</h3>
          <p>
            <strong>Nous ne vendons jamais vos données personnelles à des tiers.</strong>
          </p>
        </section>

        <section>
          <h2>5. Durée de Conservation</h2>
          <ul>
            <li><strong>Compte actif</strong> : Tant que votre compte existe</li>
            <li><strong>Codes de vérification</strong> : 10 minutes (email, 2FA, reset password)</li>
            <li><strong>Tokens de changement d'email</strong> : 24 heures</li>
            <li><strong>Tokens de suppression de compte</strong> : 24 heures</li>
            <li><strong>Sessions</strong> : 120 minutes</li>
            <li><strong>Historique de donations</strong> : 10 ans (obligation légale comptable)</li>
            <li><strong>Compte supprimé</strong> : Suppression immédiate et définitive (sauf obligations légales)</li>
          </ul>
        </section>

        <section>
          <h2>6. Vos Droits (RGPD Articles 15-22)</h2>

          <h3>6.1 Droit d'accès (Article 15)</h3>
          <p>
            Vous pouvez accéder à vos données personnelles via votre page de préférences :
            <Link to="/preferences"> Mes Préférences</Link>
          </p>

          <h3>6.2 Droit de rectification (Article 16)</h3>
          <p>
            Vous pouvez modifier vos informations personnelles (nom, image de profil, date de naissance, email)
            à tout moment dans votre profil.
          </p>

          <h3>6.3 Droit à l'effacement (Article 17)</h3>
          <p>
            Vous pouvez demander la suppression complète de votre compte via la section
            "Supprimer mon compte" dans les <Link to="/preferences">Préférences</Link>.
          </p>
          <p>
            La suppression entraîne l'effacement définitif de :
          </p>
          <ul>
            <li>Votre profil et informations personnelles</li>
            <li>Tous vos fichiers musicaux téléversés</li>
            <li>Vos albums et playlists</li>
            <li>Vos likes et abonnements</li>
            <li>Votre image de profil</li>
          </ul>
          <p>
            <em>Note : L'historique des donations peut être conservé pour des raisons comptables légales.</em>
          </p>

          <h3>6.4 Droit à la portabilité (Article 20)</h3>
          <p>
            Vous pouvez télécharger une copie de toutes vos données dans un format structuré (JSON)
            via la section "Exporter mes données" dans les <Link to="/preferences">Préférences</Link>.
          </p>

          <h3>6.5 Droit d'opposition (Article 21)</h3>
          <p>
            Vous pouvez vous opposer au traitement de vos données à des fins de marketing en désactivant
            les communications dans vos préférences.
          </p>

          <h3>6.6 Droit de retirer votre consentement</h3>
          <p>
            Vous pouvez retirer votre consentement à tout moment. Cela n'affectera pas la licéité des
            traitements effectués avant le retrait.
          </p>

          <h3>6.7 Droit de déposer une plainte</h3>
          <p>
            Vous avez le droit de déposer une plainte auprès de l'autorité de contrôle compétente :
          </p>
          <p>
            <strong>CNIL (France)</strong><br />
            3 Place de Fontenoy<br />
            TSA 80715<br />
            75334 PARIS CEDEX 07<br />
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
          </p>
        </section>

        <section>
          <h2>7. Sécurité des Données</h2>
          <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles :</p>

          <h3>7.1 Sécurité technique</h3>
          <ul>
            <li><strong>Chiffrement des mots de passe</strong> : bcrypt avec salt</li>
            <li><strong>Authentification forte</strong> : 2FA par e-mail obligatoire</li>
            <li><strong>HTTPS</strong> : Toutes les communications chiffrées (TLS)</li>
            <li><strong>Headers de sécurité</strong> : Content Security Policy, X-Frame-Options, etc.</li>
            <li><strong>Rate limiting</strong> : Protection contre les attaques par force brute</li>
            <li><strong>Tokens sécurisés</strong> : Sessions et API tokens avec expiration</li>
            <li><strong>Validation des fichiers</strong> : Prévention des uploads malveillants</li>
          </ul>

          <h3>7.2 Mesures organisationnelles</h3>
          <ul>
            <li>Accès aux données limité au personnel autorisé</li>
            <li>Contrôle d'accès basé sur les rôles (RBAC)</li>
            <li>Journalisation des accès aux données sensibles</li>
          </ul>
        </section>

        <section>
          <h2>8. Cookies et Technologies Similaires</h2>

          <h3>8.1 Cookies essentiels</h3>
          <ul>
            <li><strong>Session cookie</strong> : Maintien de votre connexion (120 minutes)</li>
            <li><strong>Token d'authentification</strong> : Stocké dans localStorage</li>
            <li><strong>XSRF-TOKEN</strong> : Protection contre les attaques CSRF</li>
          </ul>

          <h3>8.2 localStorage</h3>
          <p>
            Nous stockons votre token d'authentification dans le localStorage de votre navigateur.
            Vous pouvez le supprimer à tout moment en vous déconnectant.
          </p>
        </section>

        <section>
          <h2>9. Transferts Internationaux de Données</h2>
          <p>
            Vos données sont hébergées dans l'Union Européenne. En cas de transfert vers des pays tiers
            (ex: Stripe aux États-Unis), nous nous assurons que des garanties appropriées sont en place
            (clauses contractuelles types, Privacy Shield).
          </p>
        </section>

        <section>
          <h2>10. Modifications de la Politique de Confidentialité</h2>
          <p>
            Nous pouvons mettre à jour cette politique de confidentialité. En cas de modifications importantes,
            nous vous en informerons par e-mail et demanderons votre consentement si nécessaire.
          </p>
          <p>
            Date de dernière modification affichée en haut de cette page.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits,
            contactez-nous :
          </p>
          <ul>
            <li><strong>E-mail</strong> : privacy@rhapsody.com</li>
            <li><strong>Délai de réponse</strong> : 30 jours maximum (conformément à l'Article 12 RGPD)</li>
          </ul>
        </section>

        <section>
          <h2>12. Mineurs</h2>
          <p>
            Notre service est réservé aux personnes âgées de 18 ans et plus. Nous ne collectons pas
            sciemment de données personnelles auprès de mineurs.
          </p>
        </section>

        <div className="legal-footer">
          <Link to="/auth" className="back-link">← Retour à l'authentification</Link>
          <Link to="/terms" className="related-link">Conditions Générales d'Utilisation →</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
