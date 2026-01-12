/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        Lexend: ['Lexend', 'sans-serif'],
        Orbitron: ['Orbitron', 'sans-serif'],
        Oxanium: ['Oxanium', 'sans-serif'],
        Marvel: ['Marvel', 'sans-serif']
      },
      colors: {
        launchpadDarkLight:'#202020',
        launchpadDarkMedium:'#19191A',
        lightGray:'#C1C1C1',
        darkGray: '#838B92',
        dark: '#181823',
        lightDark: '#1F202E',
        lightBg: '#F4F7F9',
        yellow:'#FDFAE5',
        yellowButton:'#E2BF00',
        green:'#AFED64',
        greenHover:'#215B1A',
        yellowHover:'#B69C0F',
        grayBorder:'#D4D6D3',
        grayInput:'#F4F7F9',
        lightStone:'#A6A6A6',
        darkStone:'#1F1D19',
        lightestWood:"#D6C99E",
        button:"#49FDC1",
        buttonHover:"#33b88cff",
        darkCard:'#252525',
        darkCardHover:'#2B2B2B',
        arenaLight:'#6affc6ff',
        arenaMedium:'#242726ff',
        arenaDark:'#191f1eff',
        arenaBg:'#09211aff',
        linearOrange2: 'linear-gradient(to bottom, #FDDA3B, #FC7000)'
      },
      backgroundImage: {
        'linearOrange': 'linear-gradient(to bottom,rgb(132, 81, 0),rgb(23, 19, 1))',
        'linear': 'linear-gradient(to bottom,rgb(230, 240, 255),rgb(204, 201, 222))',
        'linearOrange2': 'linear-gradient(to bottom, #FDDA3B, #FC7000)',
        'linearOrange2Hover': 'linear-gradient(to bottom, #FFC107, #E65100)',
        'linearRed': 'linear-gradient(to right, #F61616, #900D0D)'

      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

