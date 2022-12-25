import React, { useState, useEffect } from "react";
import { Container, Form } from "react-bootstrap";
import useAuth from "./useAuth";
import SpotifyWebApi from "spotify-web-api-node";
import TrackSearchResult from "./TrackSearchResult";
import Player from "./Player";
import axios from "axios";

const spotifyApi = new SpotifyWebApi({
  clientId: "02c74248b5f04bdd83a5a3ac3277741e",
});
function Dashboard({ code }) {
  const access_token = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");
  const chooseTrack = (track) => {
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");
  };
  // console.log(searchResult);
  useEffect(() => {
    if (!playingTrack) return;
    axios
      .get("http://localhost:8000/lyrics", {
        params: {
          track: playingTrack.title,
          artist: playingTrack.artist,
        },
      })
      .then((res) => {
        setLyrics(res.data.lyrics);
      });
  }, [playingTrack]);
  useEffect(() => {
    if (!access_token) return;
    spotifyApi.setAccessToken(access_token);
  }, [access_token]);

  useEffect(() => {
    if (!search) return setSearchResult([]);
    if (!access_token) return;
    let cancel = false;
    spotifyApi.searchTracks(search).then((res) => {
      if (cancel) return;
      console.log(res.body.tracks);
      setSearchResult(
        res.body.tracks.items.map((track) => {
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image;
              return smallest;
            },
            track.album.images[0]
          );
          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
          };
        })
      );
    });
    return () => (cancel = true);
  }, [search, access_token]);

  return (
    <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
      <Form.Control
        type="search"
        placeholder="Search Songs/Artists"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
        {searchResult.map((track, i) => (
          <TrackSearchResult
            key={track.uri}
            track={track}
            chooseTrack={chooseTrack}
          />
        ))}
        {searchResult.length === 0 && (
          <div className="text center" style={{ whiteSpace: "pre" }}>
            {lyrics}
          </div>
        )}
      </div>
      <div>
        <Player accessToken={access_token} trackUri={playingTrack?.uri} />
      </div>
    </Container>
  );
}

export default Dashboard;
