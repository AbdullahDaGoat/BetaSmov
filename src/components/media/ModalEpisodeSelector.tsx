import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { get } from "@/backend/metadata/tmdb";
import { conf } from "@/setup/config";

interface ModalEpisodeSelectorProps {
  tmdbId: string;
  mediaTitle: string;
}

export function EpisodeSelector({
  tmdbId,
  mediaTitle,
}: ModalEpisodeSelectorProps) {
  const [seasonsData, setSeasonsData] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const navigate = useNavigate();

  const handleSeasonSelect = useCallback(
    async (season: any) => {
      try {
        const seasonDetails = await get<any>(
          `/tv/${tmdbId}/season/${season.season_number}`,
          {
            api_key: conf().TMDB_READ_API_KEY,
            language: "en-US",
          },
        );
        setSelectedSeason(seasonDetails);
      } catch (err) {
        console.error(err);
      }
    },
    [tmdbId],
  );

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const showDetails = await get<any>(`/tv/${tmdbId}`, {
          api_key: conf().TMDB_READ_API_KEY,
          language: "en-US",
        });
        setSeasonsData(showDetails.seasons);
        if (showDetails.seasons[0] === 0) {
          // Default to first season
          handleSeasonSelect(showDetails.seasons[0]);
        } else {
          handleSeasonSelect(showDetails.seasons[1]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSeasons();
  }, [handleSeasonSelect, tmdbId]);

  return (
    <div className="flex flex-row relative">
      <div className="w-24 sm:w-96 cursor-pointer overflow-y-auto overflow-x-hidden max-h-60 z-10">
        {seasonsData.map((season) => (
          <div
            key={season.season_number}
            onClick={() => handleSeasonSelect(season)}
            className={`cursor-pointer p-1 text-center rounded transition-transform duration-200 ${
              selectedSeason &&
              season.season_number === selectedSeason.season_number
                ? "bg-search-background"
                : "hover:bg-search-background hover:scale-95"
            }`}
          >
            {season.season_number !== 0
              ? `S${season.season_number}`
              : `Specials`}
          </div>
        ))}
      </div>
      <div className="flex-auto mt-4 sm:mt-0 sm:ml-4 overflow-x-auto overflow-y-hidden sm:overflow-y-auto sm:overflow-x-hidden max-h-60 max-w-[70vw] z-0">
        <div className="flex sm:grid sm:grid-cols-3 sm:gap-2">
          {selectedSeason ? (
            selectedSeason.episodes.map(
              (episode: {
                episode_number: number;
                name: string;
                still_path: string;
                show_id: number;
                id: number;
              }) => (
                <div
                  key={episode.episode_number}
                  onClick={() =>
                    navigate(
                      `/media/tmdb-tv-${tmdbId}-${mediaTitle}/${episode.show_id}/${episode.id}`,
                    )
                  }
                  className="bg-mediaCard-hoverBackground rounded p-2 hover:scale-95 transition-transform transition-border-color duration-[0.28s] ease-in-out transform-origin-center flex-shrink-0 w-48 sm:w-auto mr-2 sm:mr-0"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${episode.still_path}`}
                    className="w-full h-auto rounded"
                  />
                  <p className="text-center text-[0.95em] mt-2">
                    {episode.name}
                  </p>
                </div>
              ),
            )
          ) : (
            <div className="text-center w-full">
              Select a season to see episodes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
