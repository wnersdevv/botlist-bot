const { getConfig } = require("./config");

function parsePagination(query) {
  const { limits } = getConfig();
  let page = parseInt(query.page, 10);
  let size = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(size) || size < 1) size = limits.paginationDefaultSize;
  if (size > limits.paginationMaxSize) size = limits.paginationMaxSize;

  return { page, size, skip: (page - 1) * size };
}

function buildMeta(total, page, size) {
  return {
    page,
    limit: size,
    total,
    totalPages: Math.max(1, Math.ceil(total / size)),
  };
}

module.exports = { parsePagination, buildMeta };
