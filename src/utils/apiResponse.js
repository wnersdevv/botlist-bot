function success(res, data, meta = null, status = 200) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

function failure(res, message, status = 400, code = null) {
  const body = { success: false, error: { message } };
  if (code) body.error.code = code;
  return res.status(status).json(body);
}

module.exports = { success, failure };
