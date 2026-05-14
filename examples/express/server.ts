import express from 'express';

import {
  MovieboxSession,
  search,
  getMovieDetails,
  getMovieStreamUrl,
  downloadMovie,
  createLogger
} from 'moviebox-js-sdk';

const session = new MovieboxSession({
  logger: createLogger({ level: 'info', name: 'moviebox-express' })
});

const router = express.Router();

router.get('/search', async (req, res, next) => {
  try {
    const query = String(req.query.q ?? '').trim();
    if (!query) {
      return res.status(400).json({ error: 'Missing query param "q"' });
    }
    const results = await search(session, { query });
    res.json(results);
  } catch (error) {
    next(error);
  }
});

router.get('/movies/:detailPath', async (req, res, next) => {
  try {
    const detailPath = req.params.detailPath;
    const details = await getMovieDetails(session, { detailPath });
    res.json(details);
  } catch (error) {
    next(error);
  }
});

router.get('/movies/:detailPath/stream', async (req, res, next) => {
  try {
    const detailPath = req.params.detailPath;
    const quality = req.query.quality ? Number(req.query.quality) : undefined;
    const stream = await getMovieStreamUrl(session, { detailPath, quality });
    res.json(stream);
  } catch (error) {
    next(error);
  }
});

router.post('/movies/:detailPath/download', async (req, res, next) => {
  try {
    const detailPath = req.params.detailPath;
    const filePath = await downloadMovie(session, {
      detailPath,
      outputDir: './downloads',
      quality: req.body?.quality
    });
    res.json({ filePath });
  } catch (error) {
    next(error);
  }
});

const app = express();
app.use(express.json());
app.use('/api/moviebox', router);

app.use((error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  res.status(500).json({ error: message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Moviebox API listening on port ${PORT}`);
});
