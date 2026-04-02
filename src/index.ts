/**
 * Random User MCP — wraps randomuser.me (free, no auth)
 *
 * Tools:
 * - generate_users: Generate one or more random user profiles
 * - generate_by_gender: Generate random user profiles filtered by gender
 */

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

const BASE_URL = 'https://randomuser.me/api';

type RawUser = {
  gender: string;
  name: { title: string; first: string; last: string };
  location: {
    street: { number: number; name: string };
    city: string;
    state: string;
    country: string;
    postcode: string | number;
    coordinates: { latitude: string; longitude: string };
    timezone: { offset: string; description: string };
  };
  email: string;
  login: { uuid: string; username: string };
  dob: { date: string; age: number };
  phone: string;
  cell: string;
  picture: { large: string; medium: string; thumbnail: string };
  nat: string;
};

type RawResponse = {
  results: RawUser[];
  info: { seed: string; results: number; page: number; version: string };
};

function formatUser(u: RawUser) {
  return {
    gender: u.gender,
    name: `${u.name.title} ${u.name.first} ${u.name.last}`,
    email: u.email,
    username: u.login.username,
    uuid: u.login.uuid,
    date_of_birth: u.dob.date,
    age: u.dob.age,
    phone: u.phone,
    cell: u.cell,
    nationality: u.nat,
    location: {
      street: `${u.location.street.number} ${u.location.street.name}`,
      city: u.location.city,
      state: u.location.state,
      country: u.location.country,
      postcode: String(u.location.postcode),
    },
    picture: u.picture.medium,
  };
}

const tools: McpToolExport['tools'] = [
  {
    name: 'generate_users',
    description:
      'Generate one or more random user profiles with realistic names, addresses, emails, and photos. Optionally filter by nationality.',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of users to generate (default 1, max 100).',
        },
        nationality: {
          type: 'string',
          description:
            'Comma-separated nationality codes to filter by (e.g. "us,gb,au"). Supported: AU, BR, CA, CH, DE, DK, ES, FI, FR, GB, IE, IN, IR, MX, NL, NO, NZ, RS, TR, UA, US.',
        },
      },
    },
  },
  {
    name: 'generate_by_gender',
    description: 'Generate random user profiles filtered to a specific gender.',
    inputSchema: {
      type: 'object',
      properties: {
        gender: {
          type: 'string',
          description: 'Gender to filter by. One of: male, female.',
        },
        count: {
          type: 'number',
          description: 'Number of users to generate (default 1, max 100).',
        },
      },
      required: ['gender'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'generate_users':
      return generateUsers(
        (args.count as number | undefined) ?? 1,
        args.nationality as string | undefined,
      );
    case 'generate_by_gender':
      return generateByGender(
        args.gender as string,
        (args.count as number | undefined) ?? 1,
      );
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function generateUsers(count: number, nationality?: string) {
  const safeCount = Math.min(100, Math.max(1, count));
  const params = new URLSearchParams({ results: String(safeCount) });
  if (nationality) params.set('nat', nationality);
  const res = await fetch(`${BASE_URL}/?${params}`);
  if (!res.ok) throw new Error(`Random User API error: ${res.status}`);
  const data = (await res.json()) as RawResponse;
  return {
    count: data.results.length,
    users: data.results.map(formatUser),
  };
}

async function generateByGender(gender: string, count: number) {
  const safeCount = Math.min(100, Math.max(1, count));
  const params = new URLSearchParams({
    results: String(safeCount),
    gender,
  });
  const res = await fetch(`${BASE_URL}/?${params}`);
  if (!res.ok) throw new Error(`Random User API error: ${res.status}`);
  const data = (await res.json()) as RawResponse;
  return {
    count: data.results.length,
    gender,
    users: data.results.map(formatUser),
  };
}

export default { tools, callTool } satisfies McpToolExport;
