/*
 * Copyright (C)  Online-Go.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from "react";
import moment from "moment";
import { _ } from "@/lib/translate";
import { post } from "@/lib/requests";
import { errorAlerter, navigateTo, unitify } from "@/lib/misc";
import { PaginatedTable } from "@/components/PaginatedTable";
import { longRankString, rankString } from "@/lib/rank_utils";
import { StarRating } from "@/components/StarRating";
import { Player } from "@/components/Player";
import { MiniGoban } from "@/components/MiniGoban";
import { alert } from "@/lib/swal_config";
import { useParams } from "react-router-dom";

export function PuzzleCollectionList(): React.ReactElement {
    const { player_id } = useParams();

    return (
        <div className="page-width">
            <div className="PuzzleList container">
                <div className="puzzle-list-container" style={{ clear: "both" }}>
                    <div style={{ textAlign: "center", margin: "1rem" }}>
                        <button className="btn primary" onClick={newPuzzleCollection}>
                            {_("New puzzle collection")}
                        </button>
                    </div>

                    <PaginatedTable
                        className=""
                        source={`puzzles/collections/`}
                        orderBy={["-name"]}
                        filter={{
                            owner: player_id as string,
                        }}
                        groom={(arr) => {
                            for (const e of arr) {
                                e.min_rank_string = longRankString(e.min_rank);
                                e.max_rank_string = longRankString(e.max_rank);
                                e.min_rank_short = rankString(e.min_rank);
                                e.max_rank_short = rankString(e.max_rank);
                            }
                            return arr;
                        }}
                        onRowClick={(row, ev) => navigateTo(`/puzzle-collection/${row.id}`, ev)}
                        columns={[
                            {
                                header: "",
                                className: () => "icon",
                                render: (X) => (
                                    <MiniGoban
                                        noLink
                                        game_id={undefined}
                                        json={X.starting_puzzle}
                                        displayWidth={64}
                                        white={undefined}
                                        black={undefined}
                                    />
                                ),
                            },

                            {
                                header: _("Collection"),
                                className: () => "name",
                                orderBy: ["name"],
                                render: (X) => (
                                    <div>
                                        <div>{X.name}</div>
                                        <Player user={X.owner} />
                                    </div>
                                ),
                            },

                            {
                                header: _("Difficulty"),
                                className: () => "difficulty center",
                                orderBy: ["min_rank", "max_rank"],
                                render: (X) =>
                                    X.min_rank_string === X.max_rank_string ? (
                                        <span>{X.min_rank_string}</span>
                                    ) : (
                                        <span>
                                            {X.min_rank_short}-{X.max_rank_short}
                                        </span>
                                    ),
                            },

                            {
                                header: _("Puzzles"),
                                className: () => "puzzle-count center",
                                render: (X) => X.puzzle_count,
                                orderBy: ["-puzzle_count"],
                            },
                            {
                                header: _("Rating"),
                                className: () => "rating",
                                orderBy: ["-rating", "-rating_count"],
                                render: (X) => (
                                    <span>
                                        <StarRating value={X.rating} />{" "}
                                        <span className="rating-count">
                                            ({unitify(X.rating_count)})
                                        </span>
                                    </span>
                                ),
                            },
                            {
                                header: _("Views"),
                                className: () => "view-count right",
                                orderBy: ["-view_count"],
                                render: (X) => unitify(X.view_count),
                            },
                            {
                                header: _("Solved"),
                                className: () => "solved-count right",
                                orderBy: ["-solved_count"],
                                render: (X) => unitify(X.solved_count),
                            },
                            {
                                header: _("Created"),
                                className: () => "date center",
                                render: (X) => moment(new Date(X.created)).format("l"),
                                orderBy: ["-created"],
                            },
                            {
                                header: _("Private"),
                                className: () => "date center",
                                render: (X) => (X["private"] ? _("Private") : _("Public")),
                                orderBy: ["-private"],
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    );

    function newPuzzleCollection() {
        void alert
            .fire({
                text: _("Collection name"),
                input: "text",
                showCancelButton: true,
                inputValidator: (name): string | void => {
                    if (!name || name.length < 5) {
                        return _("Please provide a longer name for your new puzzle collection");
                    }
                },
            })
            .then(({ value: name, isConfirmed }) => {
                if (isConfirmed) {
                    post("puzzles/collections/", {
                        name: name,
                        private: true,
                        price: "0.00",
                    })
                        .then((res) => {
                            navigateTo(`/puzzle-collection/${res.id}`);
                        })
                        .catch(errorAlerter);
                }
            });
    }
}
