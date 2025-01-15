export const playlists: Record<number, { id: number; title: string; imageUrl: string; songs: { name: string; album: string; artist: string; dateAdded: string; duration: string }[] }> = {
    1: { 
        id: 1, 
        title: 'Playlist 1', 
        imageUrl: '/wilted.png', 
        songs: [
            { name: 'Song 1', album: 'Album 1', artist: 'Artist 1', dateAdded: '2023-01-01', duration: '3:45' },
            { name: 'Song 2', album: 'Album 2', artist: 'Artist 2', dateAdded: '2023-02-01', duration: '4:05' },
            { name: 'Song 3', album: 'Album 3', artist: 'Artist 3', dateAdded: '2023-03-01', duration: '2:30' },
        ]
    },
    2: { 
        id: 2, 
        title: 'Playlist 2', 
        imageUrl: '/krnge.png', 
        songs: [
            { name: 'Track 1', album: 'Album A', artist: 'Artist A', dateAdded: '2023-04-01', duration: '3:20' },
            { name: 'Track 2', album: 'Album B', artist: 'Artist B', dateAdded: '2023-05-01', duration: '3:40' }
        ]
    },
    3: { 
        id: 3, 
        title: 'Playlist 3', 
        imageUrl: '/punk.png', 
        songs: [
            { name: 'Rock 1', album: 'Album X', artist: 'Artist X', dateAdded: '2023-06-01', duration: '4:00' },
            { name: 'Rock 2', album: 'Album Y', artist: 'Artist Y', dateAdded: '2023-07-01', duration: '5:00' }
        ]
    },
};