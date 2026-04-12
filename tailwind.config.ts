import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Platform brand colors
        xstocks: '#3B82F6',   // blue-500
        ondo: '#22C55E',      // green-500
        backed: '#F59E0B',    // amber-500
        swarm: '#EC4899',     // pink-500
        securitize: '#A855F7', // purple-500
      },
    },
  },
  plugins: [],
}

export default config
