import React from 'react';

export const BoySunsetIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      <svg
        viewBox="0 0 750 1000"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Sunset Sky Gradient - Violet through Rose and Coral to Golden Peach */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#674A8C" />
            <stop offset="18%" stopColor="#8157A3" />
            <stop offset="35%" stopColor="#AD6C9C" />
            <stop offset="50%" stopColor="#D5798C" />
            <stop offset="65%" stopColor="#EA8A79" />
            <stop offset="78%" stopColor="#F9A470" />
            <stop offset="90%" stopColor="#FEC576" />
            <stop offset="100%" stopColor="#FFE095" />
          </linearGradient>

          {/* Sun Core & Radiant Atmosphere Glow */}
          <radialGradient id="sunAtmosphere" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF5" stopOpacity="1" />
            <stop offset="25%" stopColor="#FFF0B3" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#FFAE68" stopOpacity="0.5" />
            <stop offset="80%" stopColor="#F67B54" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#E06275" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="sunOrb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFF4D1" />
            <stop offset="100%" stopColor="#FFDE79" />
          </radialGradient>

          {/* Mountain Silhouettes Gradients (Misty and Layered) */}
          <linearGradient id="mountDistant" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BA8FA6" />
            <stop offset="55%" stopColor="#D4A7B3" />
            <stop offset="100%" stopColor="#E9BDAB" />
          </linearGradient>

          <linearGradient id="mountMid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8F638E" />
            <stop offset="60%" stopColor="#A87599" />
            <stop offset="100%" stopColor="#CA929A" />
          </linearGradient>

          <linearGradient id="mountNear" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6C4576" />
            <stop offset="65%" stopColor="#835384" />
            <stop offset="100%" stopColor="#A26B85" />
          </linearGradient>

          <linearGradient id="islandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#513360" />
            <stop offset="80%" stopColor="#664172" />
            <stop offset="100%" stopColor="#865682" />
          </linearGradient>

          {/* Lake Water Surface */}
          <linearGradient id="waterSurface" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E2887A" />
            <stop offset="15%" stopColor="#BF6E8F" />
            <stop offset="35%" stopColor="#96568F" />
            <stop offset="65%" stopColor="#73457E" />
            <stop offset="100%" stopColor="#503162" />
          </linearGradient>

          {/* Golden Sun Column Reflection on Water */}
          <linearGradient id="waterReflectionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFBD9" stopOpacity="0.95" />
            <stop offset="20%" stopColor="#FED166" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#FF9B42" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#E86B43" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D9505F" stopOpacity="0.2" />
          </linearGradient>

          {/* Granite Rock Facets & Sunlight Highlights */}
          <linearGradient id="rockSunlit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E89F71" />
            <stop offset="30%" stopColor="#C87F55" />
            <stop offset="70%" stopColor="#87534E" />
            <stop offset="100%" stopColor="#593949" />
          </linearGradient>

          <linearGradient id="rockShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#432E4E" />
            <stop offset="50%" stopColor="#2F1F3B" />
            <stop offset="100%" stopColor="#1E1428" />
          </linearGradient>

          <linearGradient id="rockMidtone" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C496A" />
            <stop offset="50%" stopColor="#4F3354" />
            <stop offset="100%" stopColor="#372240" />
          </linearGradient>

          {/* Boy's Mauve/Purple Knit Sweater */}
          <linearGradient id="sweaterFleece" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A273A6" />
            <stop offset="35%" stopColor="#8A5A90" />
            <stop offset="75%" stopColor="#653D70" />
            <stop offset="100%" stopColor="#4D2A59" />
          </linearGradient>

          {/* Boy's Charcoal Trousers */}
          <linearGradient id="trousersGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3A3849" />
            <stop offset="60%" stopColor="#2A2837" />
            <stop offset="100%" stopColor="#1C1A27" />
          </linearGradient>

          {/* Brown Leather Hiking Boots */}
          <linearGradient id="bootLeather" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9C6B49" />
            <stop offset="40%" stopColor="#7B4E31" />
            <stop offset="100%" stopColor="#4E2E1B" />
          </linearGradient>

          {/* Soft Filter for Golden Glow */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Sky Canvas */}
        <rect x="0" y="0" width="750" height="1000" fill="url(#skyGrad)" />

        {/* 2. Feathery Sunset Cirrus & Cumulus Clouds with Golden Light */}
        <g opacity="0.75">
          {/* High wispy cloud bands */}
          <path d="M 0 100 Q 150 70 340 110 Q 520 85 750 120 L 750 160 Q 500 130 320 150 Q 140 120 0 160 Z" fill="#9F71B0" opacity="0.45" />
          <path d="M 0 170 Q 220 130 460 165 Q 610 145 750 185 L 750 230 Q 570 190 380 220 Q 180 180 0 225 Z" fill="#C97CA3" opacity="0.5" />
          
          {/* Golden and peach illuminated cloud sweeps */}
          <path d="M 40 240 Q 250 210 490 235 Q 630 220 750 250 L 750 300 Q 580 265 410 295 Q 220 260 40 305 Z" fill="#ECA286" opacity="0.65" />
          <path d="M 0 295 Q 180 265 390 285 Q 540 270 750 310 L 750 355 Q 560 320 370 345 Q 160 320 0 350 Z" fill="#F8B885" opacity="0.6" />
          <path d="M 220 330 Q 380 310 520 330 Q 640 315 750 340 L 750 375 Q 620 350 490 365 Q 360 345 220 365 Z" fill="#FED88D" opacity="0.7" />

          {/* Glowing underbelly puffs */}
          <path d="M 80 260 Q 180 245 270 260 Q 200 275 80 270 Z" fill="#FFA57B" opacity="0.5" />
          <path d="M 340 270 Q 450 250 560 270 Q 470 288 340 280 Z" fill="#FFC887" opacity="0.55" />
          <path d="M 420 320 Q 530 305 640 320 Q 550 335 420 330 Z" fill="#FFEAA3" opacity="0.65" />
        </g>

        {/* 3. Sun and Radiant Halo (Centered right over the mountains) */}
        <circle cx="445" cy="435" r="160" fill="url(#sunAtmosphere)" />
        <circle cx="445" cy="435" r="70" fill="#FFEAA0" opacity="0.6" filter="url(#softGlow)" />
        <circle cx="445" cy="435" r="28" fill="url(#sunOrb)" />

        {/* 4. Distant Layered Mountains & Islands */}
        {/* Layer 1: Farthest pale purple misty mountains */}
        <path
          d="M 0 460 
             Q 120 405 240 435 
             Q 340 385 440 425 
             Q 520 395 620 430 
             Q 690 410 750 435 
             L 750 510 L 0 510 Z"
          fill="url(#mountDistant)"
          opacity="0.85"
        />

        {/* Layer 2: Mid-distance mountain ridges */}
        <path
          d="M 60 480 
             Q 180 430 310 470 
             Q 410 425 500 460 
             Q 590 420 680 465 
             L 750 480 L 750 535 L 60 535 Z"
          fill="url(#mountMid)"
          opacity="0.9"
        />

        {/* Layer 3: Closer mountain ridges & rounded lakeside islands */}
        <path
          d="M 210 500 
             Q 300 460 390 495 
             Q 450 515 480 505 
             Q 550 470 630 505 
             Q 690 475 750 505 
             L 750 545 L 210 545 Z"
          fill="url(#mountNear)"
        />

        {/* Island silhouettes floating on water */}
        <path
          d="M 225 528 
             Q 285 498 350 520 
             Q 385 532 420 528 
             L 435 535 L 210 535 Z"
          fill="url(#islandGrad)"
        />
        <path
          d="M 460 525 
             Q 535 485 610 520 
             Q 635 532 660 528 
             L 670 536 L 450 536 Z"
          fill="url(#islandGrad)"
        />
        <path
          d="M 630 518 
             Q 685 490 735 515 
             L 750 522 L 750 538 L 620 538 Z"
          fill="url(#islandGrad)"
        />

        {/* Low mist over water at island bases */}
        <rect x="180" y="522" width="570" height="15" fill="#F8C0AA" opacity="0.35" />

        {/* 5. Serene Water Body */}
        <rect x="0" y="530" width="750" height="470" fill="url(#waterSurface)" />

        {/* Golden Sun Column Reflection on Water */}
        <g opacity="0.85">
          {/* Central tapering reflection beam */}
          <path
            d="M 435 530 
               L 455 530 
               L 485 630 
               L 505 760 
               L 520 900 
               L 430 900 
               L 405 760 
               L 420 630 Z"
            fill="url(#waterReflectionGrad)"
            filter="url(#softGlow)"
            opacity="0.65"
          />

          {/* Horizontal shimmer ripples across the sun reflection path */}
          <ellipse cx="445" cy="542" rx="35" ry="3" fill="#FFFBE6" opacity="0.95" />
          <ellipse cx="447" cy="555" rx="55" ry="4" fill="#FFF0B0" opacity="0.9" />
          <ellipse cx="443" cy="570" rx="48" ry="4" fill="#FED880" opacity="0.85" />
          <ellipse cx="448" cy="590" rx="70" ry="5" fill="#FEB855" opacity="0.8" />
          <ellipse cx="445" cy="615" rx="65" ry="5.5" fill="#FFA542" opacity="0.75" />
          <ellipse cx="452" cy="645" rx="88" ry="6.5" fill="#FF9438" opacity="0.7" />
          <ellipse cx="448" cy="680" rx="80" ry="7" fill="#FE8442" opacity="0.65" />
          <ellipse cx="455" cy="720" rx="105" ry="8" fill="#F87348" opacity="0.6" />
          <ellipse cx="450" cy="765" rx="95" ry="8.5" fill="#EB6554" opacity="0.55" />
          <ellipse cx="458" cy="815" rx="120" ry="9" fill="#DD5B65" opacity="0.5" />
          <ellipse cx="452" cy="870" rx="140" ry="10" fill="#CC5474" opacity="0.4" />
          <ellipse cx="460" cy="930" rx="165" ry="11" fill="#BA4F82" opacity="0.3" />
        </g>

        {/* Ambient subtle horizontal water ripples */}
        <g stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" opacity="0.35">
          <line x1="310" y1="560" x2="380" y2="560" />
          <line x1="510" y1="565" x2="610" y2="565" />
          <line x1="280" y1="600" x2="370" y2="600" />
          <line x1="530" y1="610" x2="650" y2="610" />
          <line x1="320" y1="655" x2="400" y2="655" />
          <line x1="510" y1="665" x2="680" y2="665" />
          <line x1="350" y1="730" x2="415" y2="730" />
          <line x1="515" y1="745" x2="670" y2="745" />
          <line x1="480" y1="840" x2="710" y2="840" stroke="#F472B6" opacity="0.25" />
        </g>

        {/* 6. Foreground Rugged Rocky Cliff (Left & Lower Base) */}
        <g id="rocky-cliff">
          {/* Massive Deep Shadow Rock Base */}
          <path
            d="M 0 540 
               L 120 545 
               L 210 570 
               L 265 620 
               L 280 670 
               L 310 710 
               L 355 770 
               L 380 840 
               L 370 910 
               L 410 970 
               L 420 1000 
               L 0 1000 Z"
            fill="url(#rockShadow)"
          />

          {/* Cliff Face Ledges & Mid-Tones */}
          <path
            d="M 0 560 
               L 110 555 
               L 185 580 
               L 245 615 
               L 225 650 
               L 160 645 
               L 115 675 
               L 70 660 
               L 0 680 Z"
            fill="url(#rockMidtone)"
          />

          {/* Primary Shelf Rock where the Boy is Seated */}
          <path
            d="M 0 575 
               Q 70 565 140 570 
               L 215 585 
               L 255 625 
               L 230 655 
               L 165 645 
               L 110 670 
               L 45 660 
               L 0 680 Z"
            fill="url(#rockSunlit)"
            opacity="0.8"
          />

          {/* Warm Sunlit Crest on the Topmost Shelf */}
          <path
            d="M 40 570 
               Q 110 562 170 568 
               L 210 582 
               L 180 595 
               L 120 585 
               L 50 585 Z"
            fill="#FFAA75"
            opacity="0.85"
          />

          {/* Lower Ledge Facet 1 */}
          <path
            d="M 140 650 
               L 230 640 
               L 270 690 
               L 225 735 
               L 155 715 Z"
            fill="url(#rockMidtone)"
          />
          {/* Lower Ledge Facet 1 Rim Light */}
          <path
            d="M 220 645 
               L 268 685 
               L 260 705 
               L 220 675 Z"
            fill="#E28F62"
            opacity="0.9"
          />

          {/* Lower Footing Ledge (Where boots rest) */}
          <path
            d="M 190 710 
               L 255 700 
               L 295 745 
               L 250 780 
               L 180 755 Z"
            fill="url(#rockSunlit)"
            opacity="0.75"
          />
          <path
            d="M 245 705 
               L 292 742 
               L 280 760 
               L 240 735 Z"
            fill="#F6A374"
            opacity="0.95"
          />

          {/* Deep Crag Crevices (Fissures in the Slate) */}
          <g stroke="#1A1124" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
            <path d="M 90 585 L 140 615 L 125 650" />
            <path d="M 175 625 L 210 655 L 195 700" />
            <path d="M 155 710 L 185 740 L 165 790" />
            <path d="M 250 740 L 285 780 L 260 840" />
            <path d="M 210 790 L 250 830 L 235 890" />
          </g>

          {/* Detailed Golden Rim Light on Outer Crag Points */}
          <g stroke="#FFBD8A" strokeWidth="2" strokeLinecap="round" opacity="0.75" fill="none">
            <path d="M 210 580 L 255 620 L 245 645" />
            <path d="M 260 675 L 290 710" />
            <path d="M 285 735 L 320 770 L 305 810" />
            <path d="M 345 815 L 375 860 L 360 900" />
            <path d="M 365 910 L 405 970" />
          </g>
        </g>

        {/* 7. The Contemplative Boy (Sitting on Rock Profile Facing Right) */}
        <g id="contemplative-boy">
          {/* Head & Hair */}
          <g id="boy-head">
            {/* Neck with golden rim light on throat */}
            <path d="M 125 435 L 142 435 L 140 458 L 122 458 Z" fill="#D89A80" />
            <path d="M 136 435 L 142 435 L 140 458 L 135 458 Z" fill="#FFAF80" />

            {/* Face Profile turned toward sunset */}
            <path
              d="M 124 402 
                 Q 132 396 140 402 
                 Q 151 410 148 422 
                 Q 146 431 138 440 
                 Q 128 444 120 438 
                 Z"
              fill="#E5AA8E"
            />
            {/* Ear */}
            <path d="M 122 414 Q 117 416 118 424 Q 123 426 125 420 Z" fill="#D29074" />

            {/* Tousled Textured Dark Wavy Hair */}
            <path
              d="M 114 420 
                 Q 106 400 116 388 
                 Q 125 376 142 376 
                 Q 158 376 164 390 
                 Q 168 402 158 410 
                 Q 152 405 144 402 
                 Q 136 398 128 404 
                 Q 122 410 120 418 
                 Z"
              fill="#221828"
            />

            {/* Tousled Hair Locks with Sunset Edge Lighting */}
            <path d="M 135 380 Q 148 378 156 386" stroke="#9E6EAF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 124 388 Q 138 382 150 390" stroke="#7A4D8D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 152 396 Q 160 404 156 410" stroke="#FFB078" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.95" />
            <path d="M 142 377 Q 155 379 162 388" stroke="#FFC994" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9" />
          </g>

          {/* Mauve / Dusty Purple Knitted Fleece Sweater */}
          <g id="boy-sweater">
            {/* Main Torso Block with Fold Volume */}
            <path
              d="M 108 458 
                 L 158 458 
                 Q 182 485 178 535 
                 L 165 570 
                 L 100 565 
                 Q 92 525 104 475 
                 Z"
              fill="url(#sweaterFleece)"
            />

            {/* Left Arm (Relaxed slightly behind/supporting) */}
            <path
              d="M 102 468 
                 Q 85 505 88 548 
                 L 98 568 
                 L 110 560 
                 Q 105 518 114 480 
                 Z"
              fill="#523160"
            />
            {/* Left Hand on Rock */}
            <path d="M 90 564 Q 85 578 92 584 Q 102 584 102 572 Z" fill="#D89A80" />

            {/* Right Arm (Reaching gently forward towards knee) */}
            <path
              d="M 150 472 
                 Q 175 498 185 540 
                 L 178 575 
                 L 162 570 
                 Q 160 528 145 490 
                 Z"
              fill="#74467F"
            />

            {/* Forearm extending towards knee */}
            <path
              d="M 178 555 
                 L 205 572 
                 Q 218 580 212 594 
                 L 196 594 
                 L 170 575 
                 Z"
              fill="#62396E"
            />
            {/* Right Hand resting casually on knee */}
            <path d="M 204 584 Q 218 588 214 598 Q 204 602 196 594 Z" fill="#E5AA8E" />

            {/* Warm Golden Sunset Rim Highlights along the Back & Shoulder */}
            <path d="M 155 460 Q 176 495 172 538" stroke="#FFA775" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
            <path d="M 172 545 L 208 574" stroke="#FFBC8C" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
            {/* Sweater Fold Shadow Creases */}
            <path d="M 122 505 Q 140 525 155 518" stroke="#3D2049" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M 115 540 Q 135 552 152 546" stroke="#3D2049" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
          </g>

          {/* Dark Charcoal Trousers */}
          <g id="boy-trousers">
            {/* Seated Pelvis / Hips */}
            <path
              d="M 94 564 
                 L 168 566 
                 Q 188 580 195 605 
                 L 182 625 
                 L 98 620 
                 Z"
              fill="url(#trousersGrad)"
            />

            {/* Right Leg (Bent upward with knee elevated) */}
            <path
              d="M 158 578 
                 Q 182 570 208 588 
                 Q 224 608 220 638 
                 L 208 700 
                 L 184 694 
                 L 190 632 
                 Q 175 615 154 608 
                 Z"
              fill="#262535"
            />

            {/* Left Leg (Hanging naturally down the rock ledge) */}
            <path
              d="M 112 608 
                 L 148 616 
                 L 155 675 
                 L 160 755 
                 L 138 755 
                 L 128 668 
                 L 108 632 
                 Z"
              fill="#1C1B28"
            />

            {/* Trousers Sunset Rim Light & Creases */}
            <path d="M 205 595 Q 222 620 216 658" stroke="#FFA775" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 214 662 L 206 702" stroke="#E5906A" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.75" />
            <path d="M 145 640 L 154 705" stroke="#3F3E57" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
          </g>

          {/* Tan/Brown Leather Hiking Boots */}
          <g id="boy-boots">
            {/* Right Boot (Resting squarely on the rock shelf) */}
            <path
              d="M 188 694 
                 L 210 698 
                 Q 232 725 248 732 
                 L 240 746 
                 L 196 742 
                 L 184 712 
                 Z"
              fill="url(#bootLeather)"
            />
            {/* Boot Collar / Ankle Cuff */}
            <path d="M 186 695 L 210 700 L 208 708 L 184 703 Z" fill="#6B4126" />
            {/* Boot Lug Sole */}
            <path d="M 194 740 L 244 744 L 240 752 L 190 748 Z" fill="#2B180E" />
            {/* Yellow/Tan Laces */}
            <path d="M 202 708 L 218 720 M 205 718 L 222 728" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
            {/* Sunlight highlight on toe */}
            <path d="M 230 730 Q 244 734 238 744" stroke="#FFC994" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9" />

            {/* Left Boot (Lower ledge) */}
            <path
              d="M 138 752 
                 L 160 753 
                 Q 170 775 178 784 
                 L 166 792 
                 L 132 785 
                 L 128 764 
                 Z"
              fill="url(#bootLeather)"
            />
            {/* Left Boot Sole */}
            <path d="M 130 782 L 172 790 L 170 796 L 128 788 Z" fill="#20120A" />
            {/* Left Boot Laces */}
            <path d="M 144 762 L 158 772" stroke="#FBBF24" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
          </g>
        </g>

        {/* 8. Foreground Wildflowers & Alpine Flora (Matching the Uploaded Photo) */}
        {/* Bottom Left Wildflower Cluster (Lush Heather / Rhododendron) */}
        <g id="wildflowers-left">
          {/* Olive & Deep Teal Leaves */}
          <g fill="#2D3B31" opacity="0.95">
            <path d="M 0 880 Q 40 850 75 870 Q 45 895 0 910 Z" />
            <path d="M 15 905 Q 65 875 110 895 Q 70 920 10 935 Z" />
            <path d="M 30 840 Q 80 815 115 845 Q 75 865 25 870 Z" />
            <path d="M 70 870 Q 120 840 155 865 Q 115 890 65 895 Z" />
            <path d="M 90 910 Q 150 880 185 910 Q 140 935 85 935 Z" />
            <path d="M 120 940 Q 180 915 220 945 Q 170 965 110 970 Z" />
          </g>

          {/* Sunlit Leaf Edges */}
          <g stroke="#8AA574" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7">
            <path d="M 20 870 Q 55 855 85 870" />
            <path d="M 40 845 Q 85 825 115 845" />
            <path d="M 75 875 Q 125 850 155 865" />
          </g>

          {/* Delicate Purple & Violet Flower Blossoms with 5-Petal Clusters */}
          {/* Flower 1 */}
          <g transform="translate(65, 840)">
            <circle cx="0" cy="0" r="4.5" fill="#C084FC" />
            <circle cx="-5" cy="-3" r="4" fill="#D8B4FE" />
            <circle cx="5" cy="-3" r="4" fill="#D8B4FE" />
            <circle cx="-4" cy="5" r="4" fill="#A855F7" />
            <circle cx="4" cy="5" r="4" fill="#A855F7" />
            <circle cx="0" cy="1" r="2" fill="#FEF08A" />
          </g>
          {/* Flower 2 */}
          <g transform="translate(105, 825)">
            <circle cx="0" cy="0" r="5" fill="#E879F9" />
            <circle cx="-5" cy="-4" r="4.5" fill="#F0ABFC" />
            <circle cx="5" cy="-4" r="4.5" fill="#F0ABFC" />
            <circle cx="-4" cy="5" r="4.5" fill="#C026D3" />
            <circle cx="4" cy="5" r="4.5" fill="#C026D3" />
            <circle cx="0" cy="1" r="2.2" fill="#FEF08A" />
          </g>
          {/* Flower 3 */}
          <g transform="translate(135, 855)">
            <circle cx="0" cy="0" r="5" fill="#C084FC" />
            <circle cx="-5" cy="-3" r="4.5" fill="#E9D5FF" />
            <circle cx="5" cy="-3" r="4.5" fill="#E9D5FF" />
            <circle cx="-4" cy="5" r="4.5" fill="#9333EA" />
            <circle cx="4" cy="5" r="4.5" fill="#9333EA" />
            <circle cx="0" cy="1" r="2" fill="#FDE047" />
          </g>
          {/* Flower 4 */}
          <g transform="translate(95, 885)">
            <circle cx="0" cy="0" r="4" fill="#A855F7" />
            <circle cx="-4" cy="-3" r="3.5" fill="#C084FC" />
            <circle cx="4" cy="-3" r="3.5" fill="#C084FC" />
            <circle cx="0" cy="4" r="3.5" fill="#7E22CE" />
            <circle cx="0" cy="0" r="1.8" fill="#FEF08A" />
          </g>
          {/* Flower 5 */}
          <g transform="translate(155, 895)">
            <circle cx="0" cy="0" r="5" fill="#D946EF" />
            <circle cx="-5" cy="-4" r="4" fill="#F472B6" />
            <circle cx="5" cy="-4" r="4" fill="#F472B6" />
            <circle cx="-4" cy="5" r="4" fill="#A21CAF" />
            <circle cx="4" cy="5" r="4" fill="#A21CAF" />
            <circle cx="0" cy="1" r="2" fill="#FDE047" />
          </g>
          {/* Flower 6 */}
          <g transform="translate(180, 930)">
            <circle cx="0" cy="0" r="4.5" fill="#C084FC" />
            <circle cx="-4" cy="-4" r="4" fill="#E9D5FF" />
            <circle cx="4" cy="-4" r="4" fill="#E9D5FF" />
            <circle cx="0" cy="4" r="4" fill="#9333EA" />
            <circle cx="0" cy="0" r="2" fill="#FEF08A" />
          </g>
        </g>

        {/* Bottom Right Wildflower Cluster (Foreground Right Corner) */}
        <g id="wildflowers-right">
          {/* Leaves */}
          <g fill="#243429" opacity="0.95">
            <path d="M 520 1000 Q 560 940 610 965 Q 570 990 520 1000 Z" />
            <path d="M 570 1000 Q 620 930 675 955 Q 630 985 580 1000 Z" />
            <path d="M 640 1000 Q 690 920 740 945 Q 700 980 650 1000 Z" />
            <path d="M 590 950 Q 640 900 680 925 Q 640 950 600 970 Z" />
          </g>
          {/* Sunlit Leaf Edges */}
          <g stroke="#97B57F" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75">
            <path d="M 565 948 Q 615 925 655 945" />
            <path d="M 635 918 Q 685 895 725 915" />
          </g>
          {/* Flowers */}
          <g transform="translate(610, 935)">
            <circle cx="0" cy="0" r="4.5" fill="#E879F9" />
            <circle cx="-4" cy="-3" r="4" fill="#F0ABFC" />
            <circle cx="4" cy="-3" r="4" fill="#F0ABFC" />
            <circle cx="0" cy="4" r="4" fill="#A21CAF" />
            <circle cx="0" cy="0" r="1.8" fill="#FEF08A" />
          </g>
          <g transform="translate(660, 920)">
            <circle cx="0" cy="0" r="5" fill="#C084FC" />
            <circle cx="-5" cy="-4" r="4.5" fill="#E9D5FF" />
            <circle cx="5" cy="-4" r="4.5" fill="#E9D5FF" />
            <circle cx="-4" cy="5" r="4.5" fill="#7E22CE" />
            <circle cx="4" cy="5" r="4.5" fill="#7E22CE" />
            <circle cx="0" cy="1" r="2" fill="#FEF08A" />
          </g>
          <g transform="translate(710, 940)">
            <circle cx="0" cy="0" r="4.5" fill="#E879F9" />
            <circle cx="-4" cy="-3" r="4" fill="#F5D0FE" />
            <circle cx="4" cy="-3" r="4" fill="#F5D0FE" />
            <circle cx="0" cy="4" r="4" fill="#C026D3" />
            <circle cx="0" cy="0" r="1.8" fill="#FEF08A" />
          </g>
        </g>
      </svg>
    </div>
  );
};

