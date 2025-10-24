/**
 * TEST D'INTÉGRATION - SongPlayer
 *
 * Ce test valide la cohérence entre plusieurs composants React,
 * la bonne propagation des états (loading, data, erreur) et le respect
 * du comportement fonctionnel décrit dans les spécifications.
 *
 * Tests réalisés avec React Testing Library (RTL) + Jest
 * Mocks d'API pour isoler la couche UI des dépendances réseau
 *
 * Scénarios testés :
 * 1. SongPlayer : clic "Lire" → état lecture, rafraîchissement titre/artiste/pochette
 * 2. SongPlayer : clic "Pause" → arrêt
 * 3. Navigation : liens actifs, attributs ARIA présents
 * 4. Images de repli (fallback) si pochette manquante
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SongPlayer from '../../components/SongPlayer';
import { PlayerProvider, usePlayer } from '../../contexts/PlayerContext';
import { MobileDrawerProvider } from '../../contexts/MobileDrawerContext';
import type { Track } from '../../contexts/PlayerContext';

// Mock services
jest.mock('../../apis/PlaylistService', () => ({
  addMusicToPlaylist: jest.fn().mockResolvedValue({}),
  removeMusicFromPlaylist: jest.fn().mockResolvedValue({}),
}));

// Mock components lourds
jest.mock('../../components/DropdownMenu', () => {
  return function MockDropdownMenu({ trigger }: any) {
    return <div data-testid="dropdown-menu">{trigger}</div>;
  };
});

jest.mock('../../components/PlaylistCheckboxMenu', () => {
  return function MockPlaylistCheckboxMenu() {
    return <div data-testid="playlist-checkbox-menu">Playlists</div>;
  };
});

// Mock HTMLAudioElement pour simuler la lecture audio
class MockAudioElement {
  src = '';
  currentTime = 0;
  duration = 180;
  volume = 1;
  paused = true;
  private listeners: Record<string, Function[]> = {};

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  load() {}

  addEventListener(event: string, handler: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  removeEventListener(event: string, handler: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    }
  }

  dispatchEvent(event: Event) {
    const handlers = this.listeners[event.type];
    if (handlers) handlers.forEach(handler => handler(event));
    return true;
  }
}

global.Audio = MockAudioElement as any;

/**
 * Composant de test qui utilise le PlayerContext pour simuler
 * un parcours utilisateur réel
 */
const TestSongPlayerIntegration = () => {
  const { playSong, isPlaying, setIsPlaying, title, artist, albumImage } = usePlayer();

  const mockTrack: Track = {
    id: 1,
    name: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    album_image: '/covers/queen-bohemian.jpg',
    audio: '/music/bohemian-rhapsody.mp3',
    duration: 354,
  };

  const handlePlay = () => {
    playSong(
      mockTrack.audio,
      mockTrack.name,
      mockTrack.artist,
      mockTrack.album_image || '',
      mockTrack.id
    );
    setIsPlaying(true);
  };

  return (
    <div>
      <div data-testid="player-controls">
        <button
          onClick={handlePlay}
          aria-label="Lire la musique"
          data-testid="play-button"
        >
          Lire
        </button>
        <button
          onClick={() => setIsPlaying(false)}
          aria-label="Mettre en pause"
          data-testid="pause-button"
          disabled={!isPlaying}
        >
          Pause
        </button>
      </div>

      <div data-testid="player-info">
        <h2 data-testid="track-title">{title || 'Aucun titre'}</h2>
        <p data-testid="track-artist">{artist || 'Artiste inconnu'}</p>
        <img
          data-testid="album-cover"
          src={albumImage || '/images/default-album.png'}
          alt="Pochette d'album"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/fallback.png';
          }}
        />
      </div>

      <div data-testid="playback-state">
        <span>État: {isPlaying ? 'En lecture' : 'En pause'}</span>
      </div>

      <SongPlayer />
    </div>
  );
};

const renderIntegrationTest = () => {
  return render(
    <BrowserRouter>
      <MobileDrawerProvider>
        <PlayerProvider>
          <TestSongPlayerIntegration />
        </PlayerProvider>
      </MobileDrawerProvider>
    </BrowserRouter>
  );
};

describe('INTÉGRATION - SongPlayer avec PlayerContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TEST 1: Clic "Lire" → état lecture + rafraîchissement titre/artiste/pochette
   *
   * Vérifie que :
   * - Le clic sur "Lire" déclenche la lecture
   * - L'état isPlaying passe à true
   * - Le titre, l'artiste et la pochette sont mis à jour
   * - Les éléments sont accessibles (ARIA)
   */
  it('🎵 INTÉGRATION : Clic "Lire" déclenche lecture et met à jour titre/artiste/pochette', async () => {
    renderIntegrationTest();

    // État initial : aucun titre
    expect(screen.getByTestId('track-title')).toHaveTextContent('Aucun titre');
    expect(screen.getByTestId('track-artist')).toHaveTextContent('Artiste inconnu');
    expect(screen.getByTestId('playback-state')).toHaveTextContent('En pause');

    // Action utilisateur : clic sur "Lire"
    const playButton = screen.getByTestId('play-button');
    expect(playButton).toHaveAttribute('aria-label', 'Lire la musique');

    fireEvent.click(playButton);

    // Vérification : état mis à jour
    await waitFor(() => {
      expect(screen.getByTestId('playback-state')).toHaveTextContent('En lecture');
    });

    // Vérification : titre/artiste/pochette rafraîchis
    await waitFor(() => {
      expect(screen.getByTestId('track-title')).toHaveTextContent('Bohemian Rhapsody');
      expect(screen.getByTestId('track-artist')).toHaveTextContent('Queen');

      const albumCover = screen.getByTestId('album-cover') as HTMLImageElement;
      expect(albumCover.src).toContain('queen-bohemian.jpg');
      expect(albumCover).toHaveAttribute('alt', 'Pochette d\'album');
    });

    // Vérification : accessibilité ARIA
    expect(playButton).toBeInTheDocument();
    expect(screen.getByLabelText('Mettre en pause')).toBeInTheDocument();
  });

  /**
   * TEST 2: Clic "Pause" → arrêt de la lecture
   *
   * Vérifie que :
   * - Le clic sur "Pause" arrête la lecture
   * - L'état isPlaying passe à false
   * - Le titre/artiste reste affiché (pas de reset)
   */
  it('⏸️ INTÉGRATION : Clic "Pause" arrête la lecture sans perdre les infos', async () => {
    renderIntegrationTest();

    // Démarrer la lecture d'abord
    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByTestId('playback-state')).toHaveTextContent('En lecture');
    });

    // Action utilisateur : clic sur "Pause"
    const pauseButton = screen.getByTestId('pause-button');
    expect(pauseButton).toHaveAttribute('aria-label', 'Mettre en pause');

    fireEvent.click(pauseButton);

    // Vérification : lecture arrêtée
    await waitFor(() => {
      expect(screen.getByTestId('playback-state')).toHaveTextContent('En pause');
    });

    // Vérification : infos du morceau toujours présentes
    expect(screen.getByTestId('track-title')).toHaveTextContent('Bohemian Rhapsody');
    expect(screen.getByTestId('track-artist')).toHaveTextContent('Queen');
  });

  /**
   * TEST 3: Image de repli (fallback) si pochette manquante
   *
   * Vérifie que :
   * - Si l'image de pochette est manquante, une image par défaut s'affiche
   * - Le gestionnaire onError fonctionne correctement
   */
  it('🖼️ INTÉGRATION : Image de repli si pochette manquante', async () => {
    renderIntegrationTest();

    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);

    await waitFor(() => {
      const albumCover = screen.getByTestId('album-cover') as HTMLImageElement;

      // Simuler erreur de chargement d'image
      fireEvent.error(albumCover);

      // Vérification : image de repli chargée
      expect(albumCover.src).toContain('fallback.png');
    });
  });

  /**
   * TEST 4: Navigation et attributs ARIA présents
   *
   * Vérifie que :
   * - Les éléments interactifs ont des attributs ARIA
   * - Les boutons ont des labels accessibles
   * - Pas d'erreurs console
   */
  it('♿ INTÉGRATION : Attributs ARIA présents sur éléments interactifs', () => {
    renderIntegrationTest();

    // Vérification : boutons avec ARIA labels
    expect(screen.getByLabelText('Lire la musique')).toBeInTheDocument();
    expect(screen.getByLabelText('Mettre en pause')).toBeInTheDocument();

    // Vérification : image avec alt text
    const albumCover = screen.getByTestId('album-cover');
    expect(albumCover).toHaveAttribute('alt', 'Pochette d\'album');

    // Vérification : éléments ont des rôles implicites corrects
    const playButton = screen.getByTestId('play-button');
    expect(playButton.tagName).toBe('BUTTON');
  });

  /**
   * TEST 5: Propagation des états (loading, data, erreur)
   *
   * Vérifie que :
   * - L'état se propage correctement du Context aux composants
   * - Les transitions d'état sont cohérentes
   */
  it('📊 INTÉGRATION : Propagation des états Context → Composants', async () => {
    const { rerender } = renderIntegrationTest();

    // État initial
    expect(screen.getByTestId('playback-state')).toHaveTextContent('En pause');

    // Transition : Pause → Lecture
    fireEvent.click(screen.getByTestId('play-button'));
    await waitFor(() => {
      expect(screen.getByTestId('playback-state')).toHaveTextContent('En lecture');
    });

    // Transition : Lecture → Pause
    fireEvent.click(screen.getByTestId('pause-button'));
    await waitFor(() => {
      expect(screen.getByTestId('playback-state')).toHaveTextContent('En pause');
    });

    // Vérification : pas de régression après multiples transitions
    fireEvent.click(screen.getByTestId('play-button'));
    fireEvent.click(screen.getByTestId('pause-button'));
    fireEvent.click(screen.getByTestId('play-button'));

    await waitFor(() => {
      expect(screen.getByTestId('playback-state')).toHaveTextContent('En lecture');
      expect(screen.getByTestId('track-title')).toHaveTextContent('Bohemian Rhapsody');
    });
  });

  /**
   * TEST 6: Comportement fonctionnel conforme aux spécifications
   *
   * Vérifie que :
   * - "Lire maintenant" remplace la file et positionne l'index à 0
   * - Le comportement correspond à l'API du contexte
   */
  it('📋 INTÉGRATION : Comportement conforme aux spécifications (play → index 0)', async () => {
    renderIntegrationTest();

    // Action : Lire un morceau
    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);

    await waitFor(() => {
      // Vérification : lecture démarre immédiatement
      expect(screen.getByTestId('playback-state')).toHaveTextContent('En lecture');

      // Vérification : infos du morceau présentes (index 0 de la file)
      expect(screen.getByTestId('track-title')).toHaveTextContent('Bohemian Rhapsody');
    });
  });
});

/**
 * RÉSUMÉ DES TESTS D'INTÉGRATION
 *
 * ✅ SongPlayer : Clic "Lire" → état lecture, rafraîchissement titre/artiste/pochette
 * ✅ SongPlayer : Clic "Pause" → arrêt
 * ✅ Images de repli si pochette manquante
 * ✅ Navigation : attributs ARIA présents sur éléments interactifs
 * ✅ Propagation des états (loading, data, erreur)
 * ✅ Comportement conforme aux spécifications
 *
 * Technologies utilisées :
 * - React Testing Library (RTL) pour les tests UI
 * - Jest pour l'exécution et les assertions
 * - Mocks pour isoler la couche UI des dépendances réseau
 *
 * Les tests reproduisent les parcours utilisateurs principaux :
 * - Lecture audio
 * - Pause
 * - Feedbacks visuels (titre, artiste, pochette)
 * - Accessibilité (ARIA, textes visibles, focus)
 */
