const express = require('express');
const { query } = require('../db/postgres');

const router = express.Router();

router.get('/recent', async (req, res) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 20, 100);

    const result = await query(
      `
      SELECT
        g.id,
        g.mode,
        g.win_reason,
        g.ended_at,
        p1.guest_label AS player1_label,
        p1.score AS player1_score,
        p1.is_winner AS player1_is_winner,
        p2.guest_label AS player2_label,
        p2.score AS player2_score,
        p2.is_winner AS player2_is_winner
      FROM games g
      LEFT JOIN game_players p1 ON p1.game_id = g.id AND p1.player_slot = 1
      LEFT JOIN game_players p2 ON p2.game_id = g.id AND p2.player_slot = 2
      WHERE g.status = 'finished'
      ORDER BY g.ended_at DESC NULLS LAST, g.created_at DESC
      LIMIT $1
      `,
      [limit],
    );

    res.json({
      items: result.rows,
      total: result.rowCount,
    });
  } catch (error) {
    res.status(500).json({
      error: 'history_fetch_failed',
      message: error.message,
    });
  }
});

module.exports = router;
