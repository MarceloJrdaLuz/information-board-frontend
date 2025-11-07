import { createLucideIcon } from "lucide-react"
import { ElementType } from "react"

export const iconeAdd = (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)

export const iconeDecrement = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="#302F3C" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
)

export const iconeOptions = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#FF6838" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
)

export const IconeHome = (
  <div>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  </div>
)

export const iconeLogout = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)


export const iconeSetaBaixo = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

export const iconeEdit = (color: string = 'currentColor') => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" stroke={color} fill={color}>
    <title>
      edit
    </title>
    <style type="text/css"></style>
    <path d="M16.77 8l1.94-2a1 1 0 0 0 0-1.41l-3.34-3.3a1 1 0 0 0-1.41 0L12 3.23zm-5.81-3.71L1 14.25V19h4.75l9.96-9.96-4.75-4.75z" />
  </svg>
)

export const iconeAddPessoa = (color: string = '#00000') => (
  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
    width="20.000000pt" height="20.000000pt" viewBox="0 0 512.000000 512.000000"
    preserveAspectRatio="xMidYMid meet">

    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
      fill={color} stroke="none">
      <path d="M2082 4470 c-105 -15 -211 -49 -306 -97 -74 -38 -109 -65 -186 -143
-104 -103 -159 -193 -198 -320 -31 -103 -33 -153 -13 -355 18 -187 18 -190 -1
-258 -17 -60 -18 -77 -8 -135 17 -101 58 -230 95 -297 21 -37 40 -92 50 -145
41 -211 83 -327 148 -412 64 -83 77 -118 83 -230 13 -213 -7 -309 -77 -360
-14 -11 -147 -61 -295 -112 -325 -112 -465 -167 -650 -255 -217 -105 -334
-192 -368 -273 -18 -42 -36 -219 -36 -350 l0 -88 1920 0 1920 0 0 93 c0 146
-19 316 -40 357 -72 140 -398 306 -1035 526 -143 49 -264 97 -284 111 -57 44
-65 76 -64 269 1 192 7 217 78 310 69 89 106 190 145 389 15 77 32 128 55 170
39 71 69 159 91 269 16 76 16 85 -1 154 -17 68 -18 84 -4 240 18 219 17 283
-10 373 -42 136 -95 224 -201 329 -78 79 -112 104 -188 144 -131 67 -252 96
-422 101 -74 2 -163 0 -198 -5z"/>
      <path d="M3870 3025 l0 -255 -255 0 -255 0 0 -210 0 -210 255 0 255 0 0 -255
0 -255 210 0 210 0 0 255 0 255 255 0 255 0 0 210 0 210 -255 0 -255 0 0 255
0 255 -210 0 -210 0 0 -255z"/>
    </g>
  </svg>
)

export const iconeVoltar = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
  </svg>
)



export const iconeEyes = (color: string = 'currentColor') => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={`${color}`} className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>

)

export const IconeSetaDireita = <svg xmlns="http://www.w3.org/2000/svg" className="mt-1 p-1 h-8 w-12 shadow shadow-slate-900 bg-typography-200 hover:bg-typography-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
</svg>

export const IconeSetaEsquerda = <svg xmlns="http://www.w3.org/2000/svg" className="mt-1 p-1 h-8 w-12 shadow shadow-slate-900 bg-typography-200 hover:bg-typography-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
</svg>
export const IconeVoltar = <svg xmlns="http://www.w3.org/2000/svg" className="mt-1 p-1 h-8 w-12 shadow shadow-slate-900 bg-typography-200 hover:bg-typography-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
</svg>

export const IconeWhats = <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path d="M12 .5C5.7.5.5 5.7.5 12c0 2.4.7 4.6 2 6.5l-1.3 3.9c-.1.2 0 .4.1.5.2.1.4.2.6.1l4-1.3c1.8 1.2 4 1.8 6.1 1.8 6.3 0 11.5-5.2 11.5-11.5S18.3.5 12 .5zm6.9 16.2c-.3.9-1.5 1.7-2.5 1.9-.2 0-.4.1-.7.1-.8 0-1.8-.3-3.4-.9-2-.8-4-2.6-5.6-4.9l-.1-.1C6 12 5.1 10.6 5.1 9.1c0-1.7.9-2.6 1.2-3 .4-.4.9-.6 1.5-.6h.4c.5 0 .8.2 1.1.8l.2.4c.3.7.7 1.8.8 2 .2.4.2.7 0 1-.1.2-.2.4-.4.6-.1.1-.2.2-.2.3l-.3.3v.1c.3.5.9 1.4 1.7 2.1 1.1 1 1.9 1.3 2.3 1.5h.1c.1 0 .2.1.2 0 .2-.2.4-.6.7-.9l.1-.1c.3-.4.7-.5.9-.5.1 0 .3 0 .4.1.1 0 .3.1 2.2 1.1l.2.1c.3.1.5.2.6.5.4.2.3 1.1.1 1.8z" /></svg>

export const IconeSeta = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
</svg>

export const IconeRotacao = <svg xmlns="http://www.w3.org/2000/svg" className="mt-1 p-1 h-8 w-12 shadow shadow-slate-900 bg-typography-200 hover:bg-typography-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
</svg>

// export const IconHome = (size: string, hover?: boolean) => (
//   <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
//     width={size + 'pt'} height={size + 'pt'} viewBox="0 0 64.000000 64.000000"
//     preserveAspectRatio="xMidYMid meet" >

//     <g transform="translate(0.000000,64.000000) scale(0.100000,-0.100000)"
//       fill={!hover ? "#fff" : "#000000"} stroke="none">
//       <path d="M165 464 c-77 -69 -141 -129 -143 -133 -4 -11 66 -41 83 -35 12 5 15
//  -14 17 -123 l3 -128 70 0 70 0 3 48 3 47 49 0 49 0 3 -47 3 -48 70 0 70 0 3
//  128 c2 109 5 128 17 123 15 -5 85 22 85 34 0 11 -283 255 -299 257 -9 1 -79
//  -54 -156 -123z m289 -16 c98 -87 123 -114 111 -121 -11 -6 -43 17 -126 90 -61
//  54 -114 98 -119 98 -5 0 -58 -44 -119 -98 -83 -73 -115 -96 -126 -90 -12 7 13
//  34 111 121 70 62 130 112 134 112 4 0 64 -50 134 -112z m46 -249 l0 -129 -50
//  0 -50 0 0 34 c0 62 -5 66 -80 66 -75 0 -80 -4 -80 -66 l0 -34 -50 0 -50 0 0
//  129 0 129 91 82 90 81 90 -82 89 -81 0 -129z"/>
//     </g>
//   </svg>
// )


export const IconAddCongregation = (
  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
    width={'25 pt'} height={'25 pt'} viewBox="0 0 64.000000 64.000000"
    preserveAspectRatio="xMidYMid meet">

    <g transform="translate(0.000000,64.000000) scale(0.100000,-0.100000)"
      fill="#000000" stroke="none">
      <path d="M70 610 c-28 -28 -27 -84 2 -104 31 -22 64 -20 88 4 41 41 12 120
-45 120 -14 0 -34 -9 -45 -20z m84 -32 c14 -23 -3 -52 -33 -56 -42 -6 -67 38
-39 66 17 17 58 11 72 -10z"/>
      <path d="M392 610 c-28 -26 -29 -73 -2 -100 42 -42 110 -13 110 46 0 65 -63
96 -108 54z m82 -32 c24 -39 -44 -79 -74 -43 -21 25 3 67 37 63 14 -2 31 -11
37 -20z"/>
      <path d="M227 562 c-22 -25 -21 -75 1 -95 25 -22 75 -21 95 1 22 25 21 75 -1
95 -25 22 -75 21 -95 -1z m83 -21 c5 -11 10 -24 10 -30 0 -14 -29 -41 -45 -41
-18 0 -45 27 -45 45 0 20 28 45 50 45 11 0 24 -9 30 -19z"/>
      <path d="M53 468 c-33 -16 -55 -70 -51 -131 l3 -52 77 -3 c66 -2 78 -6 83 -22
5 -17 16 -20 66 -20 l59 0 0 -45 c0 -85 46 -149 125 -175 72 -24 167 17 199
85 34 70 15 171 -40 214 -14 11 -24 30 -24 43 0 45 -21 88 -51 103 -42 22
-101 19 -135 -7 -41 -32 -137 -33 -177 -1 -31 25 -94 30 -134 11z m124 -31
c12 -11 11 -22 -4 -70 l-17 -57 -63 0 -63 0 0 46 c0 53 13 82 43 94 28 12 87
5 104 -13z m326 -8 c9 -12 17 -33 17 -48 0 -25 -1 -26 -69 -27 l-68 0 -12 33
c-7 18 -9 38 -6 44 22 34 109 33 138 -2z m-163 -41 c28 -31 25 -57 -12 -95
-28 -29 -38 -33 -85 -33 l-53 0 0 53 c0 71 23 97 85 97 33 0 50 -6 65 -22z
m216 -89 c55 -52 68 -115 36 -179 -54 -109 -213 -106 -263 4 -23 52 -23 71 1
123 27 61 70 85 142 80 44 -2 64 -9 84 -28z"/>
      <path d="M420 250 c0 -27 -3 -30 -30 -30 -28 0 -30 -3 -30 -35 0 -32 2 -35 30
-35 27 0 30 -3 30 -30 0 -28 2 -30 40 -30 38 0 40 2 40 30 0 27 3 30 30 30 28
0 30 3 30 35 0 32 -2 35 -30 35 -27 0 -30 3 -30 30 0 28 -2 30 -40 30 -38 0
-40 -2 -40 -30z m50 -20 c0 -27 3 -30 30 -30 20 0 30 -5 30 -15 0 -10 -10 -15
-30 -15 -27 0 -30 -3 -30 -30 0 -16 -4 -30 -10 -30 -5 0 -10 14 -10 30 0 27
-3 30 -30 30 -20 0 -30 5 -30 15 0 10 10 15 30 15 27 0 30 3 30 30 0 17 5 30
10 30 6 0 10 -13 10 -30z"/>
    </g>
  </svg>
)

export const IconPermission = (
  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
    width={'25 pt'} height={'25 pt'} viewBox="0 0 64.000000 64.000000"
    preserveAspectRatio="xMidYMid meet" >

    <g transform="translate(0.000000,64.000000) scale(0.100000,-0.100000)"
      fill="#000000" stroke="#000000" strokeWidth={"5px"}>
      <path d="M165 606 c-32 -32 -40 -69 -25 -107 17 -40 46 -59 91 -59 74 0 119
73 85 138 -20 38 -44 52 -91 52 -25 0 -43 -8 -60 -24z m124 -22 c28 -36 27
-75 -4 -104 -35 -33 -81 -31 -112 4 -28 34 -29 65 -2 100 16 20 29 26 59 26
30 0 43 -6 59 -26z"/>
      <path d="M150 402 c-19 -9 -45 -33 -58 -51 -20 -31 -22 -45 -20 -130 l3 -96
95 -3 c94 -3 95 -4 115 -35 85 -133 285 -83 285 72 0 83 -73 161 -151 161 -16
0 -34 12 -53 36 -50 63 -143 83 -216 46z m167 -22 c39 -24 63 -62 42 -68 -8
-3 -31 -22 -51 -43 -27 -28 -39 -51 -43 -84 l-7 -45 -84 0 -84 0 0 91 c0 50 5
99 11 110 19 36 70 59 129 59 37 0 66 -6 87 -20z m163 -95 c35 -18 67 -62 70
-95 6 -64 -1 -83 -39 -121 -34 -34 -44 -39 -85 -39 -58 0 -101 21 -126 63 -70
114 61 254 180 192z"/>
      <path d="M419 239 c-6 -12 -9 -29 -6 -39 3 -12 -12 -34 -44 -66 -44 -44 -65
-75 -39 -59 6 4 18 1 26 -6 21 -18 63 23 46 44 -9 11 -7 19 12 36 14 13 30 20
36 16 18 -11 60 23 60 48 0 31 -18 47 -52 47 -18 0 -31 -7 -39 -21z m59 2 c20
-12 11 -56 -12 -56 -27 0 -43 29 -27 49 15 18 21 19 39 7z m-97 -154 c-13 -13
-26 -3 -16 12 3 6 11 8 17 5 6 -4 6 -10 -1 -17z"/>
    </g>
  </svg>
)
export const IconCategory = (
  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
    width={"25 pt"} height={"25 pt"} viewBox="0 0 50.000000 50.000000"
    preserveAspectRatio="xMidYMid meet">

    <g transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)"
      fill="#000000" stroke="none">
      <path d="M7 494 c-4 -4 -7 -97 -7 -206 l0 -198 140 0 c87 0 140 4 140 10 0 6
-50 10 -130 10 l-130 0 0 150 0 150 200 0 200 0 0 -95 c0 -58 4 -95 10 -95 7
0 10 48 8 138 l-3 137 -211 3 c-115 1 -213 -1 -217 -4z m413 -39 l0 -25 -200
0 -200 0 0 25 0 25 200 0 200 0 0 -25z"/>
      <path d="M70 340 c0 -5 9 -10 20 -10 11 0 20 5 20 10 0 6 -9 10 -20 10 -11 0
-20 -4 -20 -10z"/>
      <path d="M140 340 c0 -6 45 -10 115 -10 70 0 115 4 115 10 0 6 -45 10 -115 10
-70 0 -115 -4 -115 -10z"/>
      <path d="M70 290 c0 -5 9 -10 20 -10 11 0 20 5 20 10 0 6 -9 10 -20 10 -11 0
-20 -4 -20 -10z"/>
      <path d="M140 290 c0 -6 45 -10 115 -10 70 0 115 4 115 10 0 6 -45 10 -115 10
-70 0 -115 -4 -115 -10z"/>
      <path d="M70 240 c0 -5 9 -10 20 -10 11 0 20 5 20 10 0 6 -9 10 -20 10 -11 0
-20 -4 -20 -10z"/>
      <path d="M140 240 c0 -6 45 -10 115 -10 70 0 115 4 115 10 0 6 -45 10 -115 10
-70 0 -115 -4 -115 -10z"/>
      <path d="M70 190 c0 -5 9 -10 20 -10 11 0 20 5 20 10 0 6 -9 10 -20 10 -11 0
-20 -4 -20 -10z"/>
      <path d="M140 190 c0 -6 33 -10 80 -10 47 0 80 4 80 10 0 6 -33 10 -80 10 -47
0 -80 -4 -80 -10z"/>
      <path d="M351 186 c-87 -48 -50 -186 49 -186 51 0 100 49 100 99 0 75 -83 124
-149 87z m104 -31 c50 -49 15 -135 -55 -135 -41 0 -80 39 -80 80 0 70 86 105
135 55z"/>
      <path d="M390 130 c0 -13 -7 -20 -20 -20 -11 0 -20 -4 -20 -10 0 -5 9 -10 20
-10 13 0 20 -7 20 -20 0 -11 5 -20 10 -20 6 0 10 9 10 20 0 13 7 20 20 20 11
0 20 5 20 10 0 6 -9 10 -20 10 -13 0 -20 7 -20 20 0 11 -4 20 -10 20 -5 0 -10
-9 -10 -20z"/>
    </g>
  </svg>
)

export const IconCongregation = (
  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
    width={"25 pt"} height={"25 pt"} viewBox="0 0 50.000000 50.000000"
    preserveAspectRatio="xMidYMid meet">

    <g transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)"
      fill="#000000" stroke="none">
      <path d="M47 454 c-4 -4 -7 -76 -7 -161 l0 -153 100 0 c93 0 100 -1 100 -20 0
-19 -7 -20 -100 -20 -60 0 -100 -4 -100 -10 0 -6 77 -10 210 -10 133 0 210 4
210 10 0 6 -40 10 -100 10 -93 0 -100 1 -100 20 0 19 7 20 100 20 l101 0 -3
158 -3 157 -201 3 c-110 1 -203 -1 -207 -4z m393 -64 l0 -50 -190 0 -190 0 0
50 0 50 190 0 190 0 0 -50z m0 -150 l0 -80 -190 0 -190 0 0 80 0 80 190 0 190
0 0 -80z"/>
      <path d="M200 390 l0 -30 110 0 110 0 0 30 0 30 -110 0 -110 0 0 -30z m200 0
c0 -6 -37 -10 -90 -10 -53 0 -90 4 -90 10 0 6 37 10 90 10 53 0 90 -4 90 -10z"/>
      <path d="M84 399 c-10 -17 13 -36 27 -22 12 12 4 33 -11 33 -5 0 -12 -5 -16
-11z"/>
      <path d="M144 399 c-10 -17 13 -36 27 -22 12 12 4 33 -11 33 -5 0 -12 -5 -16
-11z"/>
      <path d="M40 50 c0 -6 77 -10 210 -10 133 0 210 4 210 10 0 6 -77 10 -210 10
-133 0 -210 -4 -210 -10z"/>
    </g>
  </svg>

)

export const IconImage = (
  <svg className="w-12 h-12 text-typography-200 dark:text-typography-600" xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true" fill="#9e9c9c" viewBox="0 0 640 512">
    <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2
     160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 
     81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9
      202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 
      428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
  </svg>
)

export const IconDelete = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 cursor-pointer">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export const PregacaoIcon = (
  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
    width="25.000000pt" height="25.000000pt" viewBox="0 0 25.000000 25.000000"
    preserveAspectRatio="xMidYMid meet">

    <g transform="translate(0.000000,25.000000) scale(0.100000,-0.100000)"
      fill="#000000" stroke="none">
    </g>
  </svg>
)

export const IconPublisher = (
  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
    width="25.000000pt" height="25.000000pt" viewBox="0 0 512.000000 512.000000"
    preserveAspectRatio="xMidYMid meet">

    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
      fill="#000000" stroke="none">
      <path d="M2082 4470 c-105 -15 -211 -49 -306 -97 -74 -38 -109 -65 -186 -143
-104 -103 -159 -193 -198 -320 -31 -103 -33 -153 -13 -355 18 -187 18 -190 -1
-258 -17 -60 -18 -77 -8 -135 17 -101 58 -230 95 -297 21 -37 40 -92 50 -145
41 -211 83 -327 148 -412 64 -83 77 -118 83 -230 13 -213 -7 -309 -77 -360
-14 -11 -147 -61 -295 -112 -325 -112 -465 -167 -650 -255 -217 -105 -334
-192 -368 -273 -18 -42 -36 -219 -36 -350 l0 -88 1920 0 1920 0 0 93 c0 146
-19 316 -40 357 -72 140 -398 306 -1035 526 -143 49 -264 97 -284 111 -57 44
-65 76 -64 269 1 192 7 217 78 310 69 89 106 190 145 389 15 77 32 128 55 170
39 71 69 159 91 269 16 76 16 85 -1 154 -17 68 -18 84 -4 240 18 219 17 283
-10 373 -42 136 -95 224 -201 329 -78 79 -112 104 -188 144 -131 67 -252 96
-422 101 -74 2 -163 0 -198 -5z"/>
      <path d="M3870 3025 l0 -255 -255 0 -255 0 0 -210 0 -210 255 0 255 0 0 -255
0 -255 210 0 210 0 0 255 0 255 255 0 255 0 0 210 0 210 -255 0 -255 0 0 255
0 255 -210 0 -210 0 0 -255z"/>
    </g>
  </svg>

)