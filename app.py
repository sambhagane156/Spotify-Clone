from flask import Flask, render_template, request, jsonify
from models import db, Playlist, Song 

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///playlist.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

def seed_songs_if_empty():
    if Song.query.first() is None:
        initial_songs = [
            {"id": 1, "title": "Sitaare", "artist": "Arijit Singh", "image": "song1.jpeg", "filename": "song1.mp3"},
            {"id": 2, "title": "Aawaara Angaara", "artist": "A.R. Rahman", "image": "song2.jpeg", "filename": "song2.mp3"},
            {"id": 3, "title": "Kashish", "artist": "Ashish Bhatia", "image": "song3.jpeg", "filename": "song3.mp3"},
            {"id": 4, "title": "Aashiq Tera", "artist": "Ashish Bhatia", "image": "song4.jpeg", "filename": "song4.mp3"},
            {"id": 5, "title": "Sahiba", "artist": "Aditya Rikhari", "image": "song5.jpeg", "filename": "song5.mp3"},
            {"id": 6, "title": "Finding Her", "artist": "Kushagra", "image": "song6.jpeg", "filename": "song6.mp3"},
            {"id": 7, "title": "I think they call this love", "artist": "Elliot James Reay", "image": "song7.jpeg", "filename": "song7.mp3"},
            {"id": 8, "title": "Ranjhanna", "artist": "A.R. Rahman", "image": "song8.jpeg", "filename": "song8.mp3"},
            {"id": 9, "title": "Softly", "artist": "Karan Aujla", "image": "song9.jpeg", "filename": "song9.mp3"},
            {"id": 10, "title": "With You", "artist": "A.P.Dhillon", "image": "song10.jpeg", "filename": "song10.mp3"},
        ]
        for s in initial_songs:
            new_song = Song(id=s['id'], title=s['title'], artist=s['artist'], image=s['image'], filename=s['filename'])
            db.session.add(new_song)
        db.session.commit()
        print("Database seeded with songs!")
@app.route('/')
def home():
    seed_songs_if_empty() 
    songs = Song.query.all()
    playlists = Playlist.query.all()

    artists = [
        {"name": "Pritam", "img": "pritam.jpeg"},
        {"name": "A.R. Rahman", "img": "ar.jpeg"},
        {"name": "Arijit Singh", "img": "arjit.jpeg"},
        {"name": "Vishal-Shekhar", "img": "vishal-shekhar.jpeg"},
        {"name": "Sachin-Jigar", "img": "sachin-jigar.jpeg"},
    ]

    return render_template(
        'home.html',
        songs=songs,
        artists=artists,
        playlists=playlists
    )
@app.route('/create_playlist', methods=['POST'])
def create_playlist():
    try:
        data = request.get_json(force=True)
        playlist_name = data.get('name')

        if not playlist_name:
            return jsonify({'success': False, 'error': 'Playlist name is required'}), 400

        new_playlist = Playlist(name=playlist_name)
        db.session.add(new_playlist)
        db.session.commit()

        return jsonify({'success': True, 'id': new_playlist.id, 'name': playlist_name})

    except Exception as e:
        print("SERVER ERROR:", e)
        return jsonify({'success': False, 'error': str(e)}), 500
@app.route('/add_to_playlist', methods=['POST'])
def add_to_playlist():
    try:
        data = request.get_json(force=True)
        playlist_id = data.get('playlist_id')
        song_id = data.get('song_id')

        playlist = Playlist.query.get(playlist_id)
        song = Song.query.get(song_id)

        if playlist and song:
            if song not in playlist.songs:
                playlist.songs.append(song)
                db.session.commit()
                return jsonify({'success': True, 'message': f'Added to {playlist.name}'})
            else:
                return jsonify({'success': False, 'message': 'Song already in playlist'})
        
        return jsonify({'success': False, 'message': 'Playlist or Song not found'}), 404

    except Exception as e:
        print("SERVER ERROR:", e)
        return jsonify({'success': False, 'error': str(e)}), 500
    
@app.route('/playlist/<int:playlist_id>')
def view_playlist(playlist_id):
    playlist = Playlist.query.get_or_404(playlist_id)
    return render_template('playlist_view.html', playlist=playlist)
if __name__ == '__main__':
    app.run(port=1516, debug=True)
