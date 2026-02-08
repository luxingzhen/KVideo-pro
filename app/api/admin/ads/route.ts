import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'config', 'ads.json');

// Ensure config dir exists
const ensureConfigDir = () => {
  const dir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const getAds = () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    // ignore
  }
  return { overlay: '', banner: '' };
};

export async function GET(request: Request) {
  // Allow public access for rendering ads
  // const password = request.headers.get('x-admin-password');
  // const serverPassword = process.env.ACCESS_PASSWORD;

  // if (serverPassword && password !== serverPassword) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  return NextResponse.json(getAds());
}

export async function POST(request: Request) {
  const password = request.headers.get('x-admin-password');
  const serverPassword = process.env.ACCESS_PASSWORD;

  if (serverPassword && password !== serverPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
