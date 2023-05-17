import React, { FC } from "react";

// 基本は https://heroicons.com/ からimportする
// オリジナルアイコンをここで定義する

export const CopyIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" {...props}>
    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
  </svg>
);

export const CopySuccessIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" {...props}>
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path
      fillRule="evenodd"
      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

export const PinIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <g>
      <rect fill="none" height="24" width="24" />
    </g>
    <g>
      <path
        d="M16,9V4l1,0c0.55,0,1-0.45,1-1v0c0-0.55-0.45-1-1-1H7C6.45,2,6,2.45,6,3v0 c0,0.55,0.45,1,1,1l1,0v5c0,1.66-1.34,3-3,3h0v2h5.97v7l1,1l1-1v-7H19v-2h0C17.34,12,16,10.66,16,9z"
        fillRule="evenodd"
      />
    </g>
  </svg>
);

export const SubdirectoryArrowLeftIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path d="m11 9 1.42 1.42L8.83 14H18V4h2v12H8.83l3.59 3.58L11 21l-6-6 6-6z"></path>
  </svg>
);

export const PalletIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -24 560 560" {...props}>
    <path d="M512 256c0 .9 0 1.8 0 2.7c-.4 36.5-33.6 61.3-70.1 61.3H344c-26.5 0-48 21.5-48 48c0 3.4 .4 6.7 1 9.9c2.1 10.2 6.5 20 10.8 29.9c6.1 13.8 12.1 27.5 12.1 42c0 31.8-21.6 60.7-53.4 62c-3.5 .1-7 .2-10.6 .2C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
  </svg>
);

export const LogoIcon: FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="133" height="129" viewBox="0 0 132.649 129" {...props}>
    <defs>
      <clipPath id="clip-path">
        <path
          id="p"
          d="M1675.8,1023.732l96.238-53.745s-43.868-3.863-65.718,6.83-24.936,24.437-27.324,31.264A77.673,77.673,0,0,0,1675.8,1023.732Z"
          transform="translate(-1675.798 -969.307)"
          fill="none"
          stroke="#707070"
          strokeWidth="4"
        />
      </clipPath>
    </defs>
    <g id="icon_128" transform="translate(-1824 -1067)">
      <rect id="r" width="99" height="99" transform="translate(1824 1097)" fill="#ffec14" />
      <path
        id="p-2"
        data-name="p"
        d="M4,4V95H95V4H4M0,0H99V99H0Z"
        transform="translate(1824 1097)"
        fill="#707070"
      />
      <g id="m" transform="translate(1853.762 1069)" clipPath="url(#clip-path)">
        <g id="g" transform="translate(-6.419 -12.724)">
          <path
            id="p-3"
            data-name="p"
            d="M1760.536,974.185l-89.734,54.477s-4.352-39.18,14.238-51.117,64.614-18.706,64.614-18.706Z"
            transform="translate(-1669.343 -955.276)"
            fill="#fff"
          />
          <path
            id="p-4"
            data-name="p"
            d="M1669.343,1029.055A238.335,238.335,0,0,1,1711.631,989c25.725-18.894,58.507-33.723,58.507-33.723l28.8,23.105Z"
            transform="translate(-1669.343 -955.276)"
            fill="#e8e8e8"
          />
        </g>
      </g>
      <path
        id="p-5"
        data-name="p"
        d="M1673.46,1027.328l.346-3.779a78.836,78.836,0,0,1,3.3-16.13c.174-.5.354-1.04.545-1.615a48.174,48.174,0,0,1,6.99-14.361,46.383,46.383,0,0,1,8.037-8.389,65.839,65.839,0,0,1,12.761-8.035c5.9-2.886,13.838-5,23.6-6.27a193,193,0,0,1,24.7-1.444c10.539,0,18.392.681,18.47.688l6.473.57Zm80.281-56.021c-26.13,0-39.733,3.973-46.544,7.306-19.46,9.524-23.4,21.373-25.75,28.453-.2.591-.382,1.149-.566,1.675a65.671,65.671,0,0,0-2.6,11.316l86.83-48.491C1762.051,971.427,1758.135,971.307,1753.741,971.307Z"
        transform="translate(177.964 99.693)"
        fill="#707070"
      />
      <rect
        id="r-2"
        data-name="r"
        width="63"
        height="5"
        transform="translate(1842 1132.89)"
        fill="#dfce11"
      />
      <rect
        id="r-3"
        data-name="r"
        width="63"
        height="5"
        transform="translate(1842 1150.323)"
        fill="#dfce11"
      />
      <rect
        id="r-4"
        data-name="r"
        width="63"
        height="5"
        transform="translate(1842 1167.756)"
        fill="#dfce11"
      />
    </g>
  </svg>
);
