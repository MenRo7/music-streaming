import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LegalPages.css';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Conditions Générales d'Utilisation</h1>
        <p className="last-updated">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <section>
          <h2>1. Acceptation des Conditions</h2>
          <p>
            En créant un compte et en utilisant <strong>Rhapsody</strong> (le "Service"), vous acceptez
            d'être lié par ces Conditions Générales d'Utilisation ("CGU"). Si vous n'acceptez pas ces
            conditions, veuillez ne pas utiliser le Service.
          </p>
        </section>

        <section>
          <h2>2. Description du Service</h2>
          <p>
            Rhapsody est une plateforme de streaming musical permettant aux utilisateurs de :
          </p>
          <ul>
            <li>Téléverser et héberger leurs fichiers musicaux</li>
            <li>Créer et gérer des albums et playlists</li>
            <li>Écouter de la musique en streaming</li>
            <li>Interagir avec d'autres utilisateurs (abonnements, likes)</li>
            <li>Recevoir des donations via Stripe Connect (utilisateurs éligibles)</li>
          </ul>
        </section>

        <section>
          <h2>3. Conditions d'Inscription</h2>

          <h3>3.1 Âge minimum</h3>
          <p>
            Vous devez avoir au moins <strong>18 ans</strong> pour créer un compte et utiliser Rhapsody.
          </p>

          <h3>3.2 Informations exactes</h3>
          <p>
            Vous vous engagez à fournir des informations exactes, complètes et à jour lors de votre inscription.
            Vous êtes responsable de maintenir la confidentialité de votre mot de passe.
          </p>

          <h3>3.3 Compte unique</h3>
          <p>
            Vous ne pouvez créer qu'un seul compte personnel. Les comptes multiples ou partagés sont interdits.
          </p>

          <h3>3.4 Vérification</h3>
          <p>
            Votre adresse e-mail doit être vérifiée pour accéder au Service. Une authentification à deux
            facteurs (2FA) par e-mail est requise à chaque connexion.
          </p>
        </section>

        <section>
          <h2>4. Obligations de l'Utilisateur</h2>

          <h3>4.1 Utilisation acceptable</h3>
          <p>Vous vous engagez à :</p>
          <ul>
            <li>Respecter les lois en vigueur</li>
            <li>Ne pas violer les droits de propriété intellectuelle d'autrui</li>
            <li>Ne pas téléverser de contenu illégal, offensant, diffamatoire ou inapproprié</li>
            <li>Ne pas utiliser le Service pour du spam ou des activités frauduleuses</li>
            <li>Ne pas tenter de contourner les mesures de sécurité</li>
            <li>Ne pas collecter les données d'autres utilisateurs sans leur consentement</li>
          </ul>

          <h3>4.2 Contenu téléversé</h3>
          <p>
            Vous êtes seul responsable du contenu que vous téléversez (musique, images). Vous garantissez
            que vous détenez tous les droits nécessaires (droits d'auteur, droits voisins) ou que vous
            avez obtenu les autorisations requises.
          </p>

          <h3>4.3 Sécurité du compte</h3>
          <p>
            Vous êtes responsable de toutes les activités effectuées depuis votre compte. En cas d'utilisation
            non autorisée, vous devez nous en informer immédiatement.
          </p>
        </section>

        <section>
          <h2>5. Propriété Intellectuelle</h2>

          <h3>5.1 Votre contenu</h3>
          <p>
            Vous conservez tous les droits de propriété intellectuelle sur le contenu que vous téléversez.
            En utilisant le Service, vous nous accordez une licence mondiale, non exclusive, libre de
            redevances pour :
          </p>
          <ul>
            <li>Héberger, stocker et afficher votre contenu</li>
            <li>Permettre le streaming de votre musique aux autres utilisateurs</li>
            <li>Effectuer des copies de sauvegarde</li>
          </ul>
          <p>
            Cette licence prend fin lorsque vous supprimez votre contenu ou votre compte.
          </p>

          <h3>5.2 Notre contenu</h3>
          <p>
            Le Service, son design, son code source, et tous les éléments qui le composent (sauf votre
            contenu) sont la propriété de Rhapsody et sont protégés par les lois sur la propriété
            intellectuelle. Toute reproduction, modification ou distribution est interdite sans autorisation.
          </p>
        </section>

        <section>
          <h2>6. Donations et Paiements</h2>

          <h3>6.1 Stripe Connect</h3>
          <p>
            Les utilisateurs peuvent recevoir des donations via Stripe Connect. En activant cette
            fonctionnalité, vous acceptez les
            <a href="https://stripe.com/legal/connect-account" target="_blank" rel="noopener noreferrer"> Conditions d'Utilisation de Stripe Connect</a>.
          </p>

          <h3>6.2 Éligibilité</h3>
          <p>
            Seuls les utilisateurs âgés de 18 ans et plus peuvent faire ou recevoir des donations.
          </p>

          <h3>6.3 Commissions</h3>
          <p>
            Rhapsody ne prélève aucune commission sur les donations. Les frais Stripe standards s'appliquent
            conformément à leur grille tarifaire.
          </p>

          <h3>6.4 Remboursements</h3>
          <p>
            Les donations sont définitives et non remboursables, sauf en cas d'erreur avérée ou de fraude.
          </p>
        </section>

        <section>
          <h2>7. Modération et Suspension</h2>

          <h3>7.1 Droit de modération</h3>
          <p>
            Nous nous réservons le droit de supprimer tout contenu qui viole ces CGU ou qui est signalé
            comme inapproprié.
          </p>

          <h3>7.2 Suspension ou résiliation</h3>
          <p>
            Nous pouvons suspendre ou résilier votre compte sans préavis en cas de :
          </p>
          <ul>
            <li>Violation grave ou répétée de ces CGU</li>
            <li>Activité illégale ou frauduleuse</li>
            <li>Violation des droits d'auteur</li>
            <li>Comportement abusif envers d'autres utilisateurs</li>
          </ul>

          <h3>7.3 Recours</h3>
          <p>
            En cas de suspension, vous pouvez nous contacter pour demander des explications ou faire appel
            de la décision.
          </p>
        </section>

        <section>
          <h2>8. Suppression de Compte</h2>
          <p>
            Vous pouvez supprimer votre compte à tout moment via la page Préférences. La suppression
            entraîne l'effacement définitif et irréversible de :
          </p>
          <ul>
            <li>Votre profil et informations personnelles</li>
            <li>Tous vos fichiers musicaux</li>
            <li>Vos albums et playlists</li>
            <li>Vos interactions sociales (likes, abonnements)</li>
          </ul>
          <p>
            <em>Note : L'historique des donations peut être conservé pour des raisons comptables légales.</em>
          </p>
        </section>

        <section>
          <h2>9. Limitation de Responsabilité</h2>

          <h3>9.1 Service "tel quel"</h3>
          <p>
            Le Service est fourni "tel quel" et "selon disponibilité". Nous ne garantissons pas que le
            Service sera ininterrompu, sécurisé ou exempt d'erreurs.
          </p>

          <h3>9.2 Interruptions</h3>
          <p>
            Nous nous réservons le droit d'interrompre temporairement le Service pour maintenance,
            mises à jour ou raisons techniques.
          </p>

          <h3>9.3 Perte de données</h3>
          <p>
            Bien que nous effectuions des sauvegardes régulières, nous ne pouvons garantir contre toute
            perte de données. Nous vous recommandons de conserver des copies de vos fichiers importants.
          </p>

          <h3>9.4 Limitation de dommages</h3>
          <p>
            Dans toute la mesure permise par la loi, Rhapsody ne sera pas responsable des dommages
            indirects, accessoires, spéciaux ou consécutifs résultant de l'utilisation ou de l'impossibilité
            d'utiliser le Service.
          </p>
        </section>

        <section>
          <h2>10. Indemnisation</h2>
          <p>
            Vous acceptez d'indemniser et de dégager Rhapsody de toute responsabilité en cas de
            réclamations, dommages ou frais (y compris les frais juridiques) résultant de :
          </p>
          <ul>
            <li>Votre utilisation du Service</li>
            <li>Votre violation de ces CGU</li>
            <li>Votre violation des droits d'un tiers, notamment les droits de propriété intellectuelle</li>
          </ul>
        </section>

        <section>
          <h2>11. Liens Externes</h2>
          <p>
            Le Service peut contenir des liens vers des sites web tiers (ex: Stripe). Nous ne sommes pas
            responsables du contenu ou des pratiques de confidentialité de ces sites.
          </p>
        </section>

        <section>
          <h2>12. Modifications des CGU</h2>
          <p>
            Nous pouvons modifier ces CGU à tout moment. Les modifications importantes vous seront notifiées
            par e-mail 30 jours avant leur entrée en vigueur. L'utilisation continue du Service après cette
            période constitue votre acceptation des nouvelles conditions.
          </p>
          <p>
            La date de dernière modification est indiquée en haut de cette page.
          </p>
        </section>

        <section>
          <h2>13. Résiliation par l'Utilisateur</h2>
          <p>
            Vous pouvez cesser d'utiliser le Service et supprimer votre compte à tout moment. Cette
            résiliation prend effet immédiatement.
          </p>
        </section>

        <section>
          <h2>14. Dispositions Générales</h2>

          <h3>14.1 Intégralité de l'accord</h3>
          <p>
            Ces CGU, ainsi que la <Link to="/privacy">Politique de Confidentialité</Link>, constituent
            l'intégralité de l'accord entre vous et Rhapsody.
          </p>

          <h3>14.2 Divisibilité</h3>
          <p>
            Si une disposition de ces CGU est jugée invalide ou inapplicable, les autres dispositions
            restent en vigueur.
          </p>

          <h3>14.3 Renonciation</h3>
          <p>
            Le fait que nous n'exerçions pas ou ne fassions pas valoir un droit ou une disposition des
            présentes CGU ne constitue pas une renonciation à ce droit ou à cette disposition.
          </p>

          <h3>14.4 Cession</h3>
          <p>
            Vous ne pouvez pas céder vos droits ou obligations en vertu de ces CGU sans notre consentement
            écrit préalable.
          </p>
        </section>

        <section>
          <h2>15. Loi Applicable et Juridiction</h2>
          <p>
            Ces CGU sont régies par le droit français. Tout litige relatif à l'interprétation ou à
            l'exécution de ces CGU sera soumis à la compétence exclusive des tribunaux de Paris, France.
          </p>
          <p>
            Conformément à l'article L.612-1 du Code de la consommation, vous avez la possibilité de
            recourir gratuitement à un médiateur de la consommation en cas de litige.
          </p>
        </section>

        <section>
          <h2>16. Contact</h2>
          <p>
            Pour toute question concernant ces Conditions Générales d'Utilisation :
          </p>
          <ul>
            <li><strong>E-mail</strong> : legal@rhapsody.com</li>
            <li><strong>Support</strong> : support@rhapsody.com</li>
          </ul>
        </section>

        <section>
          <h2>17. Droits d'Auteur et Propriété Intellectuelle</h2>

          <h3>17.1 Politique DMCA</h3>
          <p>
            Nous respectons les droits de propriété intellectuelle. Si vous estimez que votre œuvre protégée
            par le droit d'auteur a été copiée d'une manière qui constitue une violation, veuillez nous
            contacter avec :
          </p>
          <ul>
            <li>Une description de l'œuvre protégée</li>
            <li>L'emplacement du contenu en infraction sur notre Service</li>
            <li>Vos coordonnées</li>
            <li>Une déclaration de bonne foi</li>
            <li>Votre signature (physique ou électronique)</li>
          </ul>
          <p>
            <strong>E-mail DMCA</strong> : dmca@rhapsody.com
          </p>

          <h3>17.2 Contre-notification</h3>
          <p>
            Si votre contenu a été supprimé suite à une réclamation DMCA et que vous estimez qu'il s'agit
            d'une erreur, vous pouvez soumettre une contre-notification.
          </p>
        </section>

        <section>
          <h2>18. Confidentialité</h2>
          <p>
            L'utilisation de vos données personnelles est régie par notre
            <Link to="/privacy"> Politique de Confidentialité</Link>, qui fait partie intégrante de ces CGU.
          </p>
        </section>

        <div className="legal-footer">
          <Link to="/auth" className="back-link">← Retour à l'authentification</Link>
          <Link to="/privacy" className="related-link">Politique de Confidentialité →</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
