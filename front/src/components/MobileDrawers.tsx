import React from 'react';
import { useTranslation } from 'react-i18next';
import MobileDrawer from './MobileDrawer';
import Sidebar from './Sidebar';
import MusicQueue from './MusicQueue';
import { useMobileDrawer } from '../contexts/MobileDrawerContext';

const MobileDrawers: React.FC = () => {
  const { t } = useTranslation();
  const { isQueueOpen, isLibraryOpen, closeQueue, closeLibrary } = useMobileDrawer();

  return (
    <>
      {/* Queue Drawer */}
      <MobileDrawer
        isOpen={isQueueOpen}
        onClose={closeQueue}
        title={t('musicQueue.queue')}
        side="right"
      >
        <MusicQueue />
      </MobileDrawer>

      {/* Library Drawer */}
      <MobileDrawer
        isOpen={isLibraryOpen}
        onClose={closeLibrary}
        title={t('sidebar.library')}
        side="left"
      >
        <Sidebar />
      </MobileDrawer>
    </>
  );
};

export default MobileDrawers;
