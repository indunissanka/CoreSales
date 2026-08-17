const { z } = require('zod');
const api = require('./apiClient');
const resources = require('./resources');

const idSchema = z.string().describe('MongoDB _id of the record');
const bodySchema = z.record(z.any()).describe('Request body fields, forwarded as-is to the CRM API');

function toContent(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

async function call(method, path, opts) {
  try {
    const data = await api[method](path, opts);
    return toContent(data);
  } catch (err) {
    return { content: [{ type: 'text', text: `Error (${err.status || 'unknown'}): ${err.message}` }], isError: true };
  }
}

// Normalizes a resource's `ops` entries into the same { name, method, path(...args), params, hasBody } shape
// as `extra` entries, so both are registered through one loop.
function opEntries(resource) {
  const { name, base, ops = [] } = resource;
  const entries = [];
  if (ops.includes('list')) entries.push({ name: `${name}_list`, method: 'get', path: base, query: '*' });
  if (ops.includes('get')) entries.push({ name: `${name}_get`, method: 'get', path: (id) => `${base}/${id}`, params: ['id'] });
  if (ops.includes('create')) entries.push({ name: `${name}_create`, method: 'post', path: base, hasBody: true });
  if (ops.includes('update')) entries.push({ name: `${name}_update`, method: 'put', path: (id) => `${base}/${id}`, params: ['id'], hasBody: true });
  if (ops.includes('delete')) entries.push({ name: `${name}_delete`, method: 'delete', path: (id) => `${base}/${id}`, params: ['id'] });
  return entries;
}

function registerTools(server) {
  for (const resource of resources) {
    const entries = [...opEntries(resource), ...(resource.extra || [])];

    for (const entry of entries) {
      const { name, method, path, params = [], hasBody, query } = entry;

      const schemaShape = {};
      for (const p of params) schemaShape[p] = idSchema;
      if (hasBody) schemaShape.body = bodySchema;
      if (query === '*') schemaShape.query = z.record(z.string()).optional().describe('Optional query string filters');
      else if (Array.isArray(query)) for (const q of query) schemaShape[q] = z.string().optional();

      server.tool(name, `${method.toUpperCase()} ${typeof path === 'function' ? path(...params.map((p) => `:${p}`)) : path}`, schemaShape, async (input) => {
        const resolvedPath = typeof path === 'function' ? path(...params.map((p) => input[p])) : path;
        const opts = {};
        if (hasBody) opts.body = input.body;
        if (query === '*') opts.query = input.query;
        else if (Array.isArray(query)) opts.query = Object.fromEntries(query.map((q) => [q, input[q]]));
        return call(method, resolvedPath, opts);
      });
    }
  }
}

module.exports = registerTools;
