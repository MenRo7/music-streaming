export const playlists = [
	{ 
		id: 1, 
		title: 'Playlist 1', 
		imageUrl: '/wilted.png', 
		songs: [
			{ name: 'Song 1', album: 'Album 1', artist: 'Artist 1', dateAdded: '2023-01-01', duration: '3:45' },
			{ name: 'Song 2', album: 'Album 2', artist: 'Artist 2', dateAdded: '2023-02-01', duration: '4:05' },
			{ name: 'Song 3', album: 'Album 3', artist: 'Artist 3', dateAdded: '2023-03-01', duration: '2:30' },
		]
	},
	{ 
		id: 2, 
		title: 'Playlist 2', 
		imageUrl: '/krnge.png', 
		songs: [
			{ name: 'Track 1', album: 'Album A', artist: 'Artist A', dateAdded: '2023-04-01', duration: '3:20' },
			{ name: 'Track 2', album: 'Album B', artist: 'Artist B', dateAdded: '2023-05-01', duration: '3:40' }
		]
	},
	{ 
		id: 3, 
		title: 'Playlist 3', 
		imageUrl: '/punk.png', 
		songs: [
			{ name: 'Rock 1', album: 'Album X', artist: 'Artist X', dateAdded: '2023-06-01', duration: '4:00' },
			{ name: 'Rock 2', album: 'Album Y', artist: 'Artist Y', dateAdded: '2023-07-01', duration: '5:00' }
		]
	},
];

export const userStats = {
	topArtists: [
		{ name: 'Artist 1', imageUrl: '/wilted.png' },
		{ name: 'Artist 2', imageUrl: '/krnge.png' },
		{ name: 'Artist 3', imageUrl: '/punk.png' },
	],
	topAlbums: [
		{ title: 'Album 1', artist: 'Artist A', imageUrl: '/wilted.png' },
		{ title: 'Album 2', artist: 'Artist B', imageUrl: '/punk.png' },
	],
	totalListeningHours: 42,
	favoriteSong: 'Song of the Month',
};