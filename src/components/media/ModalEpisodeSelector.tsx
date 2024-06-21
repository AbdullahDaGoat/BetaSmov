import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { get } from "@/backend/metadata/tmdb";
import { useIsMobile } from "@/hooks/useIsMobile";
import { conf } from "@/setup/config";

interface ModalEpisodeSelectorProps {
  tmdbId: string;
  mediaTitle: string;
}

interface Season {
  season_number: number;
  id: number;
}

interface ShowDetails {
  seasons: Season[];
}

export function EpisodeSelector({
  tmdbId,
  mediaTitle,
}: ModalEpisodeSelectorProps) {
  const [seasonsData, setSeasonsData] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  const handleSeasonSelect = useCallback(
    async (season: Season) => {
      try {
        const seasonDetails = await get<any>(
          `/tv/${tmdbId}/season/${season.season_number}`,
          {
            api_key: conf().TMDB_READ_API_KEY,
            language: "en-US",
          },
        );
        setSelectedSeason({
          ...seasonDetails,
          season_number: season.season_number,
          id: season.id,
        });
      } catch (err) {
        console.error(err);
      }
    },
    [tmdbId],
  );

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const showDetails = await get<ShowDetails>(`/tv/${tmdbId}`, {
          api_key: conf().TMDB_READ_API_KEY,
          language: "en-US",
        });
        setSeasonsData(showDetails.seasons);
        const regularSeasons = showDetails.seasons.filter(
          (season: Season) => season.season_number > 0,
        );
        if (regularSeasons.length > 0) {
          handleSeasonSelect(regularSeasons[0]);
        } else if (showDetails.seasons.length > 0) {
          handleSeasonSelect(showDetails.seasons[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSeasons();
  }, [handleSeasonSelect, tmdbId]);

  return (
    <div className={`flex ${isMobile ? "flex-col" : "flex-row"}`}>
      <div
        className={`${isMobile ? "w-full" : "w-96"} cursor-pointer overflow-y-auto overflow-x-hidden ${isMobile ? "max-h-40" : "max-h-60"} ${isMobile ? "" : "max-w-24"} ${isMobile ? "order-1" : ""}`}
      >
        {seasonsData.map((season: Season) => (
          <div
            key={season.id}
            onClick={() => handleSeasonSelect(season)}
            className={`cursor-pointer p-1 text-center rounded transition-transform duration-200 ${
              selectedSeason && season.id === selectedSeason.id
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
      <div
        className={`flex-auto ${isMobile ? "mt-4" : "ml-4"} cursor-pointer overflow-y-auto overflow-x-hidden ${isMobile ? "max-h-[calc(100vh-200px)]" : "max-h-60"} ${isMobile ? "order-2" : ""}`}
      >
        <div
          className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-3"} gap-2`}
        >
          {selectedSeason ? (
            selectedSeason.episodes.map(
              (episode: {
                episode_number: number;
                name: string;
                still_path: string;
                id: number;
              }) => (
                <div
                  key={episode.id}
                  onClick={() => {
                    const url = `/media/tmdb-tv-${tmdbId}-${mediaTitle}/${selectedSeason.id}/${episode.id}`;
                    navigate(url);
                  }}
                  className="bg-mediaCard-hoverBackground rounded p-2 hover:scale-95 transition-transform transition-border-color duration-[0.28s] ease-in-out transform-origin-center"
                >
                  <div className="relative pt-[56.25%]">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                      className="absolute top-0 left-0 w-full h-full object-cover rounded"
                      alt={episode.name}
                    />
                  </div>
                  <p className="text-center text-xs sm:text-[0.95em] mt-2 truncate">
                    {`S${selectedSeason.season_number}E${episode.episode_number}: ${episode.name}`}
                  </p>
                </div>
              ),
            )
          ) : (
            <div className="text-center w-full col-span-full">
              Select a season to see episodes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
