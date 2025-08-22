const { CacheKeys } = require('librechat-data-provider');
const getLogStores = require('~/cache/getLogStores');
const { isEnabled } = require('~/server/utils');
const { saveConvo } = require('~/models');
const { logger } = require('~/config');

const addTitle = async (req, { text, response, client }) => {
  logger.error('start with title fetching');
  const { TITLE_CONVO = 'true' } = process.env ?? {};
  if (!isEnabled(TITLE_CONVO)) {
    return;
  }
  logger.error('TITLE_CONVO is enabled in env, continue =>');

  if (client.options.titleConvo === false) {
    return;
  }
  logger.error('TITLE_CONVO is enabled in client options, continue =>');

  const titleCache = getLogStores(CacheKeys.GEN_TITLE);
  const key = `${req.user.id}-${response.conversationId}`;

  logger.error('key is', key);
  const title = await client.titleConvo({
    text,
    responseText: response?.text ?? '',
    conversationId: response.conversationId,
  });
  await titleCache.set(key, title, 120000);
  await saveConvo(
    req,
    {
      conversationId: response.conversationId,
      title,
    },
    { context: 'api/server/services/Endpoints/openAI/addTitle.js' },
  );
};

module.exports = addTitle;
