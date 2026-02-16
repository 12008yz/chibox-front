import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Wallet, Lock, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTopUpBalanceMutation, useApplyPromoCodeMutation } from '../features/user/userApi';
import { useGetSubscriptionTiersQuery, useBuySubscriptionMutation } from '../features/subscriptions/subscriptionsApi';
import Monetary from './Monetary';
import { ReceivedIcon, ExchangeIcon } from './icons';
import { getApiErrorMessage } from '../utils/config';

// Красивая SVG иконка банковской карты с современным дизайном
const BankCardIcon = () => (
  <svg width="72" height="48" viewBox="0 0 72 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e3a5f" />
        <stop offset="50%" stopColor="#2d5a87" />
        <stop offset="100%" stopColor="#3d7ab3" />
      </linearGradient>
      <linearGradient id="chipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d4af37" />
        <stop offset="50%" stopColor="#f4d03f" />
        <stop offset="100%" stopColor="#d4af37" />
      </linearGradient>
      <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>

    {/* Основа карты */}
    <rect x="0" y="0" width="72" height="48" rx="6" fill="url(#cardGradient)" />

    {/* Блик на карте */}
    <ellipse cx="60" cy="10" rx="30" ry="20" fill="url(#shineGradient)" />

    {/* EMV чип */}
    <rect x="8" y="12" width="14" height="11" rx="2" fill="url(#chipGradient)" />
    <rect x="8" y="12" width="14" height="11" rx="2" stroke="rgba(180,140,50,0.5)" strokeWidth="0.5" fill="none" />
    {/* Линии на чипе */}
    <line x1="8" y1="17.5" x2="22" y2="17.5" stroke="rgba(120,90,30,0.4)" strokeWidth="0.5" />
    <line x1="15" y1="12" x2="15" y2="23" stroke="rgba(120,90,30,0.4)" strokeWidth="0.5" />
    <line x1="11" y1="12" x2="11" y2="23" stroke="rgba(120,90,30,0.3)" strokeWidth="0.3" />
    <line x1="19" y1="12" x2="19" y2="23" stroke="rgba(120,90,30,0.3)" strokeWidth="0.3" />

    {/* Contactless иконка */}
    <g stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none" strokeLinecap="round">
      <path d="M26 14 Q30 17.5 26 21" />
      <path d="M29 12 Q35 17.5 29 23" />
      <path d="M32 10 Q40 17.5 32 25" />
    </g>

    {/* Номер карты */}
    <g fill="rgba(255,255,255,0.85)">
      <circle cx="10" cy="34" r="1.2" />
      <circle cx="14" cy="34" r="1.2" />
      <circle cx="18" cy="34" r="1.2" />
      <circle cx="22" cy="34" r="1.2" />

      <circle cx="30" cy="34" r="1.2" />
      <circle cx="34" cy="34" r="1.2" />
      <circle cx="38" cy="34" r="1.2" />
      <circle cx="42" cy="34" r="1.2" />
    </g>

    {/* Дата */}
    <text x="10" y="44" fill="rgba(255,255,255,0.6)" fontSize="5" fontFamily="monospace">VALID</text>
    <text x="26" y="44" fill="rgba(255,255,255,0.8)" fontSize="6" fontFamily="monospace">12/28</text>

    {/* Логотипы платежных систем */}
    <circle cx="55" cy="38" r="5" fill="#eb001b" opacity="0.95" />
    <circle cx="63" cy="38" r="5" fill="#f79e1b" opacity="0.95" />
  </svg>
);

// Логотип СБП (Система быстрых платежей)
const SBPIcon = () => (
  <svg width="56" height="56" viewBox="0 0 239 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <path d="m 206.66462,34.253692 v 29.338 h -10.476 v -20.58 h -10.087 v 20.58 h -10.476 v -29.34 h 31.039 z" fill="#000000" />
    <path d="m 154.11062,64.640692 c 9.378,0 16.342,-5.75 16.342,-14.467 0,-8.437 -5.138,-13.915 -13.725,-13.915 -3.963,0 -7.233,1.395 -9.696,3.802 0.588,-4.975 4.795,-8.607 9.427,-8.607 1.069,0 9.117,-0.017 9.117,-0.017 l 4.551,-8.709 c 0,0 -10.104,0.23 -14.801,0.23 -10.732,0.187 -17.981,9.942 -17.981,21.79 0,13.803 7.07,19.893 16.766,19.893 z m 0.057,-20.668 c 3.482,0 5.896,2.288 5.896,6.2 0,3.521 -2.145,6.422 -5.896,6.43 -3.588,0 -6.002,-2.688 -6.002,-6.37 0,-3.913 2.414,-6.26 6.002,-6.26 z" fill="#000000" fillRule="evenodd" clipRule="evenodd" />
    <path d="m 128.81762,53.769692 c 0,0 -2.474,1.426 -6.169,1.696 -4.248,0.126 -8.033,-2.557 -8.033,-7.324 0,-4.65 3.34,-7.315 7.926,-7.315 2.812,0 6.532,1.949 6.532,1.949 0,0 2.722,-4.995 4.132,-7.493 -2.582,-1.957 -6.021,-3.03 -10.021,-3.03 -10.095,0 -17.914,6.582 -17.914,15.83 0,9.366 7.349,15.795 17.914,15.601 2.953,-0.11 7.027,-1.147 9.51,-2.742 z" fill="#000000" />
    <path d="M0 26.12l14.532 25.975v15.844L.017 93.863 0 26.12z" fill="#5B57A2" />
    <path d="M55.797 42.643l13.617-8.346 27.868-.026-41.485 25.414V42.643z" fill="#D90751" />
    <path d="M55.72 25.967l.077 34.39-14.566-8.95V0l14.49 25.967z" fill="#FAB718" />
    <path d="M97.282 34.271l-27.869.026-13.693-8.33L41.231 0l56.05 34.271z" fill="#ED6F26" />
    <path d="M55.797 94.007V77.322l-14.566-8.78.008 51.458 14.558-25.993z" fill="#63B22F" />
    <path d="M69.38 85.737L14.531 52.095 0 26.12l97.223 59.583-27.844.034z" fill="#1487C9" />
    <path d="M41.24 120l14.556-25.993 13.583-8.27 27.843-.034L41.24 120z" fill="#017F36" />
    <path d="M.017 93.863l41.333-25.32-13.896-8.526-12.922 7.922L.017 93.863z" fill="#984995" />
    <path d="m 114.61862,83.336692 c -0.32,0.408 -0.741,0.716 -1.246,0.924 a 4.282,4.282 0 0 1 -1.632,0.316 4.63,4.63 0 0 1 -1.633,-0.274 3.623,3.623 0 0 1 -1.262,-0.782 3.539,3.539 0 0 1 -0.824,-1.224 4.173,4.173 0 0 1 -0.295,-1.589 c 0,-0.54 0.093,-1.04 0.286,-1.514 0.185,-0.475 0.454,-0.882 0.791,-1.224 0.337,-0.349 0.741,-0.615 1.195,-0.823 0.463,-0.2 0.968,-0.308 1.523,-0.308 0.598,0 1.153,0.075 1.658,0.224 0.505,0.15 0.934,0.4 1.287,0.75 l -0.614,1.04 a 2.886,2.886 0 0 0 -1.027,-0.6 3.612,3.612 0 0 0 -1.119,-0.174 c -0.336,0 -0.656,0.066 -0.967,0.191 a 2.591,2.591 0 0 0 -0.825,0.533 2.438,2.438 0 0 0 -0.564,0.832 c -0.143,0.324 -0.21,0.682 -0.21,1.081 0,0.408 0.075,0.774 0.218,1.09 0.144,0.325 0.337,0.6 0.581,0.832 0.244,0.234 0.53,0.408 0.858,0.525 0.329,0.125 0.674,0.183 1.044,0.183 0.454,0 0.867,-0.092 1.22,-0.267 a 3.05,3.05 0 0 0 0.926,-0.69 z m 1.733,1.065 v -7.405 h 1.33 v 5.517 l 4.325,-5.517 h 1.33 v 7.406 h -1.33 v -5.517 l -4.325,5.517 h -1.33 z m 15.795,-1.065 a 3.01,3.01 0 0 1 -1.245,0.924 4.291,4.291 0 0 1 -1.633,0.316 4.628,4.628 0 0 1 -1.632,-0.274 3.627,3.627 0 0 1 -1.263,-0.782 3.539,3.539 0 0 1 -0.824,-1.224 4.173,4.173 0 0 1 -0.295,-1.589 c 0,-0.54 0.093,-1.04 0.286,-1.514 0.186,-0.475 0.455,-0.882 0.791,-1.224 0.337,-0.349 0.741,-0.615 1.195,-0.823 a 3.637,3.637 0 0 1 1.523,-0.308 c 0.598,0 1.153,0.075 1.658,0.224 0.505,0.15 0.934,0.4 1.288,0.75 l -0.615,1.04 a 2.874,2.874 0 0 0 -1.026,-0.6 3.616,3.616 0 0 0 -1.119,-0.174 2.603,2.603 0 0 0 -1.793,0.724 2.536,2.536 0 0 0 -0.564,0.832 c -0.143,0.324 -0.21,0.682 -0.21,1.081 0,0.408 0.076,0.774 0.219,1.09 0.143,0.325 0.336,0.6 0.58,0.832 0.244,0.234 0.531,0.408 0.859,0.525 0.328,0.116 0.673,0.183 1.043,0.183 0.455,0 0.859,-0.092 1.22,-0.267 a 3.05,3.05 0 0 0 0.926,-0.69 z m 0.682,-6.34 h 6.824 v 1.315 h -2.743 v 6.09 h -1.33 v -6.09 h -2.743 v -1.315 z" fill="#000000" />
    <path d="m 145.86362,84.327692 c 0.505,-0.158 0.934,-0.4 1.304,-0.732 l -0.404,-1.032 c -0.244,0.217 -0.572,0.4 -0.967,0.55 -0.396,0.15 -0.842,0.224 -1.33,0.224 -0.732,0 -1.338,-0.191 -1.818,-0.582 -0.479,-0.392 -0.74,-0.94 -0.799,-1.64 h 5.756 c 0.059,-0.258 0.084,-0.549 0.084,-0.89 0,-0.508 -0.093,-0.965 -0.278,-1.381 a 3.277,3.277 0 0 0 -0.74,-1.074 3.295,3.295 0 0 0 -1.111,-0.69 3.692,3.692 0 0 0 -1.355,-0.25 c -0.623,0 -1.17,0.108 -1.649,0.308 a 3.637,3.637 0 0 0 -1.204,0.824 3.477,3.477 0 0 0 -0.748,1.223 4.272,4.272 0 0 0 -0.261,1.514 c 0,0.583 0.101,1.115 0.286,1.59 a 3.5,3.5 0 0 0 0.808,1.223 c 0.345,0.34 0.765,0.599 1.262,0.782 a 4.772,4.772 0 0 0 1.658,0.274 5.04,5.04 0 0 0 1.506,-0.24 z m -3.366,-5.7 c 0.412,-0.374 0.959,-0.557 1.649,-0.557 0.648,0 1.17,0.175 1.549,0.525 0.379,0.349 0.58,0.832 0.614,1.447 h -4.544 a 2.26,2.26 0 0 1 0.732,-1.414 z" fill="#000000" fillRule="evenodd" clipRule="evenodd" />
    <path d="m 149.49862,76.996692 h 1.212 l 2.878,3.67 2.726,-3.67 h 1.178 v 7.406 h -1.329 v -5.4 l -2.592,3.436 h -0.051 l -2.692,-3.437 v 5.4 h -1.33 z" fill="#000000" />
    <path d="m 161.11062,77.021692 a 4.187,4.187 0 0 0 -1.144,0.49 l 0.353,1.05 c 0.303,-0.15 0.606,-0.275 0.909,-0.383 0.303,-0.109 0.69,-0.159 1.153,-0.159 0.37,0 0.665,0.059 0.892,0.175 0.227,0.108 0.395,0.275 0.513,0.475 0.118,0.2 0.194,0.449 0.236,0.74 0.042,0.291 0.059,0.607 0.059,0.949 a 2.28,2.28 0 0 0 -0.909,-0.375 5.229,5.229 0 0 0 -0.959,-0.1 c -0.396,0 -0.766,0.059 -1.12,0.158 -0.353,0.1 -0.656,0.25 -0.9,0.45 a 2.14,2.14 0 0 0 -0.589,0.74 2.3,2.3 0 0 0 -0.219,1.007 c 0,0.724 0.211,1.29 0.631,1.69 0.421,0.399 0.976,0.598 1.666,0.598 0.623,0 1.12,-0.108 1.498,-0.324 0.379,-0.217 0.682,-0.466 0.901,-0.749 v 0.957 h 1.245 v -4.543 c 0,-0.966 -0.21,-1.714 -0.639,-2.239 -0.421,-0.524 -1.17,-0.79 -2.23,-0.79 -0.472,0 -0.918,0.066 -1.347,0.183 z m 2.223,6 c -0.303,0.216 -0.699,0.315 -1.187,0.315 -0.429,0 -0.766,-0.108 -1.001,-0.316 -0.236,-0.216 -0.354,-0.499 -0.354,-0.849 0,-0.207 0.042,-0.382 0.135,-0.54 0.093,-0.158 0.219,-0.283 0.362,-0.383 a 1.6,1.6 0 0 1 0.513,-0.225 c 0.194,-0.05 0.387,-0.075 0.589,-0.075 0.657,0 1.22,0.158 1.683,0.491 v 0.94 a 3.824,3.824 0 0 1 -0.74,0.641 z m 13.733,-8.63 c 0.269,-0.124 0.521,-0.332 0.757,-0.64 l -0.724,-1.04 c -0.185,0.25 -0.395,0.424 -0.631,0.516 a 4.007,4.007 0 0 1 -0.774,0.216 l -0.252,0.045 c -0.219,0.038 -0.454,0.08 -0.707,0.122 a 5.224,5.224 0 0 0 -1.178,0.366 c -0.598,0.258 -1.077,0.607 -1.439,1.048 -0.362,0.441 -0.648,0.94 -0.842,1.49 a 7.793,7.793 0 0 0 -0.395,1.722 c -0.068,0.6 -0.101,1.173 -0.101,1.722 0,0.708 0.092,1.348 0.277,1.922 0.186,0.575 0.446,1.057 0.791,1.448 0.345,0.4 0.758,0.7 1.246,0.916 0.488,0.216 1.035,0.324 1.649,0.324 0.564,0 1.086,-0.108 1.557,-0.308 a 3.758,3.758 0 0 0 1.212,-0.823 c 0.336,-0.342 0.606,-0.75 0.791,-1.207 0.193,-0.458 0.286,-0.949 0.286,-1.465 0,-0.557 -0.084,-1.064 -0.244,-1.514 a 3.271,3.271 0 0 0 -0.69,-1.156 3.072,3.072 0 0 0 -1.103,-0.75 3.827,3.827 0 0 0 -1.447,-0.266 c -0.32,0 -0.631,0.042 -0.934,0.125 a 3.604,3.604 0 0 0 -0.842,0.358 3.2,3.2 0 0 0 -0.698,0.54 c -0.202,0.209 -0.37,0.442 -0.488,0.708 h -0.034 c 0.026,-0.341 0.068,-0.69 0.143,-1.048 0.076,-0.358 0.185,-0.7 0.329,-1.024 0.143,-0.324 0.328,-0.616 0.555,-0.882 a 2.52,2.52 0 0 1 0.875,-0.624 4.646,4.646 0 0 1 1.153,-0.374 l 0.264,-0.048 c 0.263,-0.048 0.514,-0.094 0.754,-0.144 0.32,-0.066 0.614,-0.15 0.884,-0.274 z m -4.679,7.115 a 4.146,4.146 0 0 1 -0.185,-1.298 2.09,2.09 0 0 1 0.303,-0.707 c 0.143,-0.225 0.328,-0.424 0.547,-0.6 a 2.773,2.773 0 0 1 1.733,-0.59 c 0.783,0 1.372,0.241 1.784,0.716 0.413,0.482 0.615,1.081 0.615,1.805 0,0.358 -0.068,0.683 -0.185,0.982 a 2.36,2.36 0 0 1 -1.279,1.323 c -0.303,0.133 -0.632,0.2 -1.002,0.2 -0.37,0 -0.707,-0.075 -1.018,-0.225 a 2.34,2.34 0 0 1 -0.8,-0.624 3.129,3.129 0 0 1 -0.513,-0.982 z m 16.401,-4.51 h -1.33 v 7.406 h 1.33 z m -8.281,0 h 1.33 v 2.222 h 1.229 c 0.58,0 1.051,0.075 1.43,0.216 0.379,0.142 0.682,0.333 0.909,0.566 0.227,0.233 0.387,0.508 0.48,0.815 0.092,0.308 0.143,0.624 0.143,0.957 0,0.333 -0.051,0.65 -0.16,0.966 -0.101,0.316 -0.278,0.59 -0.514,0.84 -0.235,0.25 -0.555,0.45 -0.959,0.6 -0.404,0.149 -0.892,0.232 -1.481,0.232 h -2.415 v -7.414 z m 1.33,3.461 v 2.713 h 0.968 c 0.665,0 1.136,-0.116 1.405,-0.35 0.27,-0.233 0.404,-0.565 0.404,-1.006 0,-0.45 -0.143,-0.79 -0.412,-1.024 -0.278,-0.233 -0.741,-0.35 -1.38,-0.35 h -0.985 z" fill="#000000" fillRule="evenodd" clipRule="evenodd" />
    <path d="m 197.58262,83.336692 c -0.32,0.408 -0.741,0.716 -1.246,0.924 a 4.286,4.286 0 0 1 -1.632,0.316 4.63,4.63 0 0 1 -1.633,-0.274 3.613,3.613 0 0 1 -1.262,-0.782 3.555,3.555 0 0 1 -0.825,-1.224 4.192,4.192 0 0 1 -0.294,-1.589 c 0,-0.54 0.092,-1.04 0.286,-1.514 0.185,-0.475 0.454,-0.882 0.791,-1.224 0.337,-0.349 0.74,-0.615 1.195,-0.823 a 3.634,3.634 0 0 1 1.523,-0.308 c 0.597,0 1.153,0.075 1.658,0.224 0.505,0.15 0.934,0.4 1.287,0.75 l -0.614,1.04 a 2.886,2.886 0 0 0 -1.027,-0.6 3.612,3.612 0 0 0 -1.119,-0.174 c -0.336,0 -0.656,0.066 -0.968,0.191 a 2.587,2.587 0 0 0 -0.824,0.533 2.52,2.52 0 0 0 -0.564,0.832 c -0.143,0.324 -0.21,0.682 -0.21,1.081 0,0.408 0.075,0.774 0.218,1.09 0.143,0.325 0.337,0.6 0.581,0.832 0.244,0.234 0.53,0.408 0.858,0.525 0.329,0.116 0.674,0.183 1.044,0.183 0.454,0 0.858,-0.092 1.22,-0.267 a 3.05,3.05 0 0 0 0.926,-0.69 z m 0.681,-6.34 h 6.825 v 1.315 h -2.744 v 6.09 h -1.329 v -6.09 h -2.743 v -1.315 z" fill="#000000" />
    <path d="m 207.86562,76.997692 h -1.33 v 10.7 h 1.33 v -3.636 c 0.269,0.175 0.589,0.3 0.959,0.383 0.37,0.083 0.757,0.124 1.153,0.124 0.589,0 1.119,-0.108 1.599,-0.307 a 3.825,3.825 0 0 0 1.228,-0.84 c 0.345,-0.359 0.606,-0.775 0.791,-1.266 0.185,-0.49 0.278,-1.015 0.278,-1.572 0,-0.55 -0.084,-1.057 -0.244,-1.515 a 3.524,3.524 0 0 0 -0.69,-1.181 2.996,2.996 0 0 0 -1.086,-0.774 3.49,3.49 0 0 0 -1.439,-0.283 c -0.521,0 -1.009,0.1 -1.472,0.3 -0.463,0.2 -0.825,0.44 -1.077,0.74 z m 0.926,1.373 c 0.379,-0.2 0.791,-0.3 1.237,-0.3 0.387,0 0.732,0.058 1.044,0.183 0.303,0.125 0.555,0.3 0.766,0.533 0.21,0.233 0.37,0.5 0.471,0.815 0.109,0.316 0.16,0.658 0.16,1.032 0,0.4 -0.068,0.757 -0.185,1.09 a 2.4,2.4 0 0 1 -0.514,0.849 2.36,2.36 0 0 1 -0.816,0.557 2.685,2.685 0 0 1 -1.086,0.208 c -0.361,0 -0.698,-0.041 -1.018,-0.124 a 3.328,3.328 0 0 1 -0.984,-0.45 v -3.67 c 0.235,-0.282 0.547,-0.523 0.925,-0.723 z m 15.281,-1.374 h -1.33 v 7.406 h 1.33 z m -8.289,0 h 1.33 v 2.222 h 1.228 c 0.581,0 1.052,0.075 1.431,0.216 0.379,0.142 0.682,0.333 0.909,0.566 0.227,0.233 0.387,0.508 0.479,0.815 0.093,0.308 0.143,0.624 0.143,0.957 0,0.333 -0.05,0.65 -0.159,0.966 -0.101,0.316 -0.278,0.59 -0.514,0.84 -0.235,0.25 -0.555,0.45 -0.959,0.6 -0.404,0.149 -0.892,0.232 -1.481,0.232 h -2.415 v -7.414 z m 1.339,3.461 v 2.713 h 0.968 c 0.664,0 1.136,-0.116 1.405,-0.35 0.269,-0.233 0.404,-0.565 0.404,-1.006 0,-0.45 -0.143,-0.79 -0.412,-1.024 -0.278,-0.233 -0.741,-0.35 -1.38,-0.35 h -0.985 z" fill="#000000" fillRule="evenodd" clipRule="evenodd" />
    <path d="m 230.45162,80.566692 2.844,3.836 h -1.632 l -2.197,-2.996 -2.23,2.996 h -1.548 l 2.827,-3.77 -2.659,-3.636 h 1.633 l 2.028,2.796 2.061,-2.796 h 1.549 z m -116.817,12.989 h -4.081 v 6.174 h -1.33 v -7.405 h 6.74 v 7.405 h -1.329 z m 8.877,0.083 h -2.625 l -0.085,1.248 c -0.092,1.057 -0.218,1.906 -0.395,2.554 -0.177,0.65 -0.396,1.149 -0.648,1.498 -0.252,0.35 -0.547,0.591 -0.884,0.708 a 3.06,3.06 0 0 1 -1.085,0.183 l -0.101,-1.282 c 0.143,0.008 0.311,-0.025 0.496,-0.108 0.186,-0.083 0.371,-0.266 0.547,-0.54 0.177,-0.284 0.337,-0.683 0.48,-1.199 0.143,-0.524 0.236,-1.206 0.286,-2.064 l 0.135,-2.305 h 5.209 v 7.406 h -1.33 v -6.1 z" fill="#000000" />
    <path d="m 127.42662,92.341692 c -0.43,0.116 -0.817,0.282 -1.145,0.49 l 0.354,1.049 c 0.303,-0.15 0.606,-0.275 0.908,-0.383 0.303,-0.108 0.691,-0.158 1.153,-0.158 0.371,0 0.665,0.058 0.892,0.174 0.228,0.109 0.396,0.275 0.514,0.475 0.117,0.2 0.193,0.45 0.235,0.74 0.042,0.292 0.059,0.608 0.059,0.949 a 2.277,2.277 0 0 0 -0.909,-0.374 5.22,5.22 0 0 0 -0.959,-0.1 c -0.395,0 -0.766,0.058 -1.119,0.158 -0.354,0.1 -0.657,0.25 -0.901,0.45 a 2.14,2.14 0 0 0 -0.589,0.74 2.3,2.3 0 0 0 -0.218,1.007 c 0,0.723 0.21,1.29 0.631,1.689 0.42,0.399 0.976,0.599 1.666,0.599 0.623,0 1.119,-0.108 1.498,-0.325 0.378,-0.216 0.681,-0.466 0.9,-0.749 v 0.957 h 1.246 v -4.543 c 0,-0.965 -0.211,-1.714 -0.64,-2.238 -0.421,-0.525 -1.17,-0.79 -2.23,-0.79 a 5.1,5.1 0 0 0 -1.346,0.182 z m 2.23,5.998 c -0.302,0.217 -0.698,0.317 -1.186,0.317 -0.438,0 -0.766,-0.108 -1.001,-0.317 -0.236,-0.216 -0.354,-0.499 -0.354,-0.848 0,-0.208 0.042,-0.383 0.135,-0.541 0.092,-0.158 0.219,-0.283 0.362,-0.383 0.143,-0.1 0.319,-0.175 0.513,-0.225 a 2.33,2.33 0 0 1 0.589,-0.074 c 0.656,0 1.22,0.158 1.683,0.49 v 0.94 a 3.83,3.83 0 0 1 -0.741,0.641 z" fill="#000000" fillRule="evenodd" clipRule="evenodd" />
    <path d="m 132.94562,92.324692 h 6.825 v 1.314 h -2.744 v 6.091 h -1.329 v -6.09 h -2.743 v -1.315 z" fill="#000000" />
    <path d="m 145.98162,99.654692 c 0.505,-0.158 0.934,-0.4 1.304,-0.732 l -0.404,-1.032 c -0.244,0.217 -0.572,0.4 -0.968,0.55 -0.395,0.15 -0.841,0.224 -1.329,0.224 -0.732,0 -1.338,-0.191 -1.818,-0.582 -0.48,-0.391 -0.74,-0.94 -0.799,-1.64 h 5.756 c 0.058,-0.257 0.084,-0.549 0.084,-0.89 0,-0.507 -0.093,-0.965 -0.278,-1.381 a 3.264,3.264 0 0 0 -0.741,-1.073 3.28,3.28 0 0 0 -1.11,-0.691 3.696,3.696 0 0 0 -1.355,-0.25 c -0.623,0 -1.17,0.108 -1.649,0.308 a 3.618,3.618 0 0 0 -1.204,0.824 3.494,3.494 0 0 0 -0.749,1.223 4.294,4.294 0 0 0 -0.261,1.514 c 0,0.583 0.101,1.115 0.286,1.59 0.186,0.474 0.463,0.882 0.808,1.223 0.345,0.341 0.766,0.599 1.263,0.782 a 4.766,4.766 0 0 0 1.657,0.275 c 0.497,0 1.002,-0.084 1.507,-0.242 z m -3.374,-5.708 c 0.412,-0.374 0.959,-0.557 1.649,-0.557 0.657,0 1.17,0.183 1.549,0.524 0.378,0.35 0.58,0.832 0.614,1.448 h -4.544 a 2.26,2.26 0 0 1 0.732,-1.415 z m 5.848,-1.622 h 1.683 l 2.566,3.57 -2.743,3.835 h -1.632 l 2.877,-3.836 -2.751,-3.57 z m 4.577,0 h 1.33 v 7.405 h -1.33 z m 6.084,7.405 -2.928,-3.836 2.735,-3.57 h -1.65 l -2.583,3.57 2.777,3.836 z m 6.076,-0.075 c 0.505,-0.158 0.934,-0.4 1.304,-0.732 l -0.404,-1.032 c -0.244,0.217 -0.572,0.4 -0.967,0.55 -0.396,0.15 -0.842,0.224 -1.33,0.224 -0.732,0 -1.338,-0.191 -1.818,-0.582 -0.479,-0.391 -0.74,-0.94 -0.799,-1.64 h 5.756 c 0.059,-0.257 0.084,-0.549 0.084,-0.89 0,-0.507 -0.092,-0.965 -0.278,-1.381 a 3.276,3.276 0 0 0 -0.74,-1.073 3.284,3.284 0 0 0 -1.111,-0.691 3.692,3.692 0 0 0 -1.355,-0.25 c -0.622,0 -1.169,0.108 -1.649,0.308 a 3.624,3.624 0 0 0 -1.203,0.824 3.465,3.465 0 0 0 -0.749,1.223 4.272,4.272 0 0 0 -0.261,1.514 c 0,0.583 0.101,1.115 0.286,1.59 0.185,0.474 0.463,0.882 0.808,1.223 0.345,0.341 0.765,0.599 1.262,0.782 a 4.772,4.772 0 0 0 1.658,0.275 5.04,5.04 0 0 0 1.506,-0.242 z m -3.374,-5.708 c 0.413,-0.374 0.96,-0.557 1.65,-0.557 0.648,0 1.169,0.183 1.548,0.524 0.379,0.35 0.581,0.832 0.614,1.448 h -4.544 a 2.26,2.26 0 0 1 0.732,-1.415 z m 10.595,-4.11 c -0.783,0 -1.212,-0.433 -1.279,-1.298 h -1.254 c 0,0.332 0.059,0.632 0.168,0.915 0.11,0.283 0.27,0.524 0.48,0.724 0.21,0.2 0.48,0.358 0.791,0.482 0.311,0.125 0.673,0.183 1.085,0.183 0.379,0 0.716,-0.058 1.019,-0.183 0.303,-0.116 0.555,-0.282 0.774,-0.482 0.21,-0.2 0.379,-0.441 0.496,-0.724 0.118,-0.283 0.177,-0.583 0.177,-0.915 h -1.245 c -0.059,0.865 -0.472,1.298 -1.212,1.298 z m -3.594,2.487 v 7.406 h 1.33 l 4.325,-5.517 v 5.517 h 1.33 v -7.406 h -1.33 l -4.325,5.517 v -5.517 z" fill="#000000" fillRule="evenodd" clipRule="evenodd" />
  </svg>
);

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'balance' | 'subscription';
  initialSelectedSubscription?: number;
}

type PaymentMethod = {
  id: string;
  name: string;
  icon: React.ReactElement;
  badge?: string;
  enabled: boolean;
  type: 'sbp' | 'card' | 'crypto' | 'other';
  /** backend: 'unitpay' (карта / СБП) */
  payment_method: string;
  /** для unitpay: сразу открыть форму карты или СБП */
  unitpay_system?: 'card' | 'sbp';
};

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, initialTab = 'balance', initialSelectedSubscription }) => {
  const { } = useTranslation();

  const [activeTab, setActiveTab] = useState<'balance' | 'subscription'>(initialTab);
  const [selectedMethod, setSelectedMethod] = useState<string>('unitpay_card');
  const [amount, setAmount] = useState<string>('10');
  const [promoCode, setPromoCode] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState<number | null>(initialSelectedSubscription || null);

  const [topUpBalance, { isLoading: isTopUpLoading }] = useTopUpBalanceMutation();
  const [applyPromo] = useApplyPromoCodeMutation();
  const [buySubscription, { isLoading: isSubscriptionLoading }] = useBuySubscriptionMutation();

  const { data: subscriptionTiersData } = useGetSubscriptionTiersQuery();
  const subscriptionTiers = subscriptionTiersData?.data || [];

  // Обновляем selectedSubscription при изменении initialSelectedSubscription
  useEffect(() => {
    if (initialSelectedSubscription !== undefined) {
      setSelectedSubscription(initialSelectedSubscription);
    }
  }, [initialSelectedSubscription]);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'unitpay_card',
      name: 'Банковская карта',
      icon: (
        <div className="flex items-center justify-center w-full h-full">
          <BankCardIcon />
        </div>
      ),
      badge: 'VISA, МИР, MASTERCARD',
      enabled: true,
      type: 'card',
      payment_method: 'unitpay',
      unitpay_system: 'card'
    },
    {
      id: 'unitpay_sbp',
      name: 'СБП',
      icon: (
        <div className="flex items-center justify-center w-full h-full">
          <SBPIcon />
        </div>
      ),
      badge: 'СИСТЕМА БЫСТРЫХ ПЛАТЕЖЕЙ',
      enabled: true,
      type: 'sbp',
      payment_method: 'unitpay',
      unitpay_system: 'sbp'
    },
  ];

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
  const minAmount = 10;

  const handleDeposit = async () => {
    if (!agreedToTerms) {
      toast.error('Необходимо принять пользовательское соглашение');
      return;
    }

    const amountNum = parseInt(amount);
    if (amountNum < minAmount) {
      toast.error(`Минимальная сумма: ${minAmount} ChiCoins`);
      return;
    }

    if (!selectedPaymentMethod?.enabled) {
      toast.error('Этот способ оплаты временно недоступен');
      return;
    }

    try {
      const payload: { amount: number; currency: string; payment_method: string; unitpay_system?: string } = {
        amount: amountNum,
        currency: 'ChiCoins',
        payment_method: selectedPaymentMethod?.payment_method || 'unitpay'
      };
      if (selectedPaymentMethod?.unitpay_system) {
        payload.unitpay_system = selectedPaymentMethod.unitpay_system;
      }
      const result = await topUpBalance(payload).unwrap();

      if (result.success && result.data) {
        if (result.data.paymentUrl) {
          window.location.href = result.data.paymentUrl;
          toast.success('Переход к оплате...');
          onClose();
        }
      }
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Ошибка создания платежа'));
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    try {
      const result = await applyPromo({ promo_code: promoCode }).unwrap();
      if (result.success) {
        toast.success(result.message || 'Промокод применён!');
        setPromoCode('');
      }
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Неверный промокод'));
    }
  };

  const handleSubscriptionPurchase = async (tierId: number) => {
    try {
      const result = await buySubscription({
        tierId,
        method: 'bank_card',
        paymentMethod: 'unitpay',
        unitpay_system: selectedMethod === 'unitpay_sbp' ? 'sbp' : selectedMethod === 'unitpay_card' ? 'card' : undefined
      }).unwrap();

      if (result.success) {
        if (result.data?.paymentUrl) {
          window.location.href = result.data.paymentUrl;
          toast.success('Переход к оплате...');
          onClose();
        } else {
          toast.success('Подписка успешно активирована!');
          onClose();
        }
      }
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Ошибка при покупке подписки'));
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div data-no-click-sound className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div data-no-click-sound className="relative bg-[#1a1f2e] rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-700/30">

        {/* Header */}
        <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/20">
          <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
            {activeTab === 'balance' ? (
              <>
                <div className="p-1.5 sm:p-2 rounded-lg bg-gray-800">
                  <Wallet className="text-white text-base sm:text-xl" />
                </div>
                <span className="hidden sm:inline">Пополнение баланса</span>
                <span className="sm:hidden">Баланс</span>
              </>
            ) : (
              <>
                <div className="p-1.5 sm:p-2 rounded-lg bg-gray-800">
                  <Crown className="text-white text-base sm:text-xl" />
                </div>
                <span className="hidden sm:inline">Премиум подписка</span>
                <span className="sm:hidden">VIP статус</span>
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="text-lg sm:text-xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="relative flex space-x-2 p-3 sm:p-4 bg-[#151a26]">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2 font-medium text-sm sm:text-base ${
              activeTab === 'balance'
                ? 'bg-gray-700 text-white shadow-lg'
                : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <img src="/images/chiCoin.png" alt="chiCoin" className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Баланс</span>
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2 font-medium text-sm sm:text-base ${
              activeTab === 'subscription'
                ? 'bg-gray-700 text-white shadow-lg'
                : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Crown className="text-base sm:text-xl" />
            <span>VIP</span>
          </button>
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-6 max-h-[calc(95vh-200px)] overflow-y-auto">
          {activeTab === 'balance' ? (
            /* Balance Tab */
            <>
              {/* Mobile/Tablet Version */}
              <div className="block lg:hidden space-y-6">
                {/* Step 1: Amount Input */}
                <div className="bg-gray-800/40 rounded-lg p-4 sm:p-6 border border-gray-700/30 space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">Шаг 1: Введите сумму</h3>
                    <p className="text-xs sm:text-sm text-gray-400">Минимальная сумма пополнения {minAmount} ChiCoins</p>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      Сумма пополнения
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={minAmount}
                        className="w-full bg-gray-900/70 border border-gray-700 rounded-lg pl-4 pr-4 py-3 sm:py-4 text-white text-xl sm:text-2xl font-semibold focus:outline-none focus:border-gray-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="100"
                      />

                    </div>
                  </div>

                  {/* Promo Code */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      Промокод на бонус к пополнению (опционально)
                      <span className="text-xs text-purple-400 font-normal">DEPOSIT5, DEPOSIT10, DEPOSIT15</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Введите промокод (например, DEPOSIT10)"
                        className="flex-1 bg-gray-900/70 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors uppercase text-sm sm:text-base"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-colors text-sm sm:text-base shadow-lg hover:shadow-purple-500/50"
                      >
                        OK
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 После активации промокода вы получите дополнительный бонус к текущему балансу
                    </p>
                  </div>
                </div>

                {/* Step 2: Payment Method Selection */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">Шаг 2: Выберите платежную систему</h3>
                    <p className="text-xs sm:text-sm text-gray-400">Безопасная оплата через проверенных партнеров</p>
                  </div>

                  {/* Payment Methods Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => method.enabled && setSelectedMethod(method.id)}
                        disabled={!method.enabled}
                        className={`
                          relative rounded-xl border-2 transition-all duration-300 overflow-hidden
                          ${selectedMethod === method.id && method.enabled
                            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-emerald-500 shadow-lg shadow-emerald-500/20'
                            : method.enabled
                            ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-500 hover:bg-gray-800/70'
                            : 'bg-gray-900/20 border-gray-700/30 opacity-40 cursor-not-allowed'
                          }
                        `}
                      >
                        {/* Badge */}
                        {method.badge && (
                          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-900/80 backdrop-blur-sm rounded-md text-[8px] sm:text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
                            {method.badge}
                          </div>
                        )}

                        {/* Check Mark */}
                        {selectedMethod === method.id && method.enabled && (
                          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}

                        <div className="p-5 sm:p-8 flex flex-col items-center justify-center gap-4 sm:gap-5">
                          {/* Logo */}
                          <div className="w-full flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
                            {method.icon}
                          </div>

                          {/* Name */}
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-semibold text-white">
                              {method.name}
                            </div>
                          </div>
                        </div>

                        {/* Glow effect when selected */}
                        {selectedMethod === method.id && method.enabled && (
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Info Text */}
                  <div className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700/30 flex items-start gap-2 sm:gap-3">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white mb-1 text-xs sm:text-sm">Защищенная оплата</p>
                      <p className="text-gray-400 text-xs sm:text-sm">Выберите способ — после нажатия «Пополнить» откроется форма оплаты картой или СБП без дополнительного выбора</p>
                    </div>
                  </div>
                </div>

                {/* Step 3: Confirm Payment */}
                <div className="bg-gray-800/40 rounded-lg p-4 sm:p-6 border border-gray-700/30 space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">Шаг 3: Подтвердите оплату</h3>
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-600 bg-gray-900/50 text-white focus:ring-2 focus:ring-gray-500 cursor-pointer flex-shrink-0"
                    />
                    <label htmlFor="terms" className="text-xs sm:text-sm text-gray-300 cursor-pointer select-none leading-relaxed">
                      Я принимаю условия{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 underline font-medium">
                        Пользовательского соглашения
                      </a>
                    </label>
                  </div>

                  {/* Deposit Button */}
                  <button
                    onClick={handleDeposit}
                    disabled={isTopUpLoading || !agreedToTerms || parseInt(amount) < minAmount || !selectedPaymentMethod?.enabled}
                    className="w-full py-3 sm:py-4 bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold text-sm sm:text-base rounded-lg transition-colors flex items-center justify-center gap-2 sm:gap-3"
                  >
                    <Wallet className="text-base sm:text-lg" />
                    <span>{isTopUpLoading ? 'Создание платежа...' : 'Пополнить баланс'}</span>
                  </button>

                  {/* Selected Method Info */}
                  {selectedPaymentMethod && (
                    <div className="text-center text-xs text-gray-500 pt-2">
                      Оплата через: <span className="text-gray-300 font-medium">{selectedPaymentMethod.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Version */}
              <div className="hidden lg:grid lg:grid-cols-[1fr_400px] gap-6">
                {/* Left Side - Payment Methods */}
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Выберите платежную систему</h3>
                    <p className="text-sm text-gray-400">Безопасная оплата через проверенных партнеров</p>
                  </div>

                  {/* Payment Methods Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => method.enabled && setSelectedMethod(method.id)}
                        disabled={!method.enabled}
                        className={`
                          relative rounded-xl border-2 transition-all duration-300 overflow-hidden
                          ${selectedMethod === method.id && method.enabled
                            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-emerald-500 shadow-lg shadow-emerald-500/20'
                            : method.enabled
                            ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-500 hover:bg-gray-800/70'
                            : 'bg-gray-900/20 border-gray-700/30 opacity-40 cursor-not-allowed'
                          }
                        `}
                      >
                        {/* Badge */}
                        {method.badge && (
                          <div className="absolute top-3 right-3 px-3 py-1 bg-gray-900/80 backdrop-blur-sm rounded-md text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
                            {method.badge}
                          </div>
                        )}

                        {/* Check Mark */}
                        {selectedMethod === method.id && method.enabled && (
                          <div className="absolute top-3 left-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}

                        <div className="p-8 flex flex-col items-center justify-center gap-5">
                          {/* Logo */}
                          <div className="w-full flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
                            {method.icon}
                          </div>

                          {/* Name */}
                          <div className="text-center">
                            <div className="text-base font-semibold text-white">
                              {method.name}
                            </div>
                          </div>
                        </div>

                        {/* Glow effect when selected */}
                        {selectedMethod === method.id && method.enabled && (
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Info Text */}
                  <div className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 flex items-start gap-3">
                    <Lock className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white mb-1">Защищенная оплата</p>
                      <p className="text-gray-400">Выберите способ — после «Пополнить» откроется форма оплаты картой или СБП без дополнительного выбора</p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Payment Form */}
                <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700/30 space-y-5 h-fit sticky top-0">
                  {/* Amount Input */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      Сумма пополнения
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={minAmount}
                        className="w-full bg-gray-900/70 border border-gray-700 rounded-lg pl-4 pr-4 py-4 text-white text-2xl font-semibold focus:outline-none focus:border-gray-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="100"
                      />

                    </div>
                  </div>

                  {/* Promo Code */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                       Промокод (опционально)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Введите промокод"
                        className="flex-1 bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors uppercase"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                      >
                        OK
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700/50"></div>

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-white focus:ring-2 focus:ring-gray-500 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer select-none leading-relaxed">
                      Я принимаю условия{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 underline font-medium">
                        Пользовательского соглашения
                      </a>
                    </label>
                  </div>

                  {/* Deposit Button */}
                  <button
                    onClick={handleDeposit}
                    disabled={isTopUpLoading || !agreedToTerms || parseInt(amount) < minAmount || !selectedPaymentMethod?.enabled}
                    className="w-full py-4 bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold text-base rounded-lg transition-colors flex items-center justify-center gap-3"
                  >
                    <Wallet className="text-lg" />
                    <span>{isTopUpLoading ? 'Создание платежа...' : 'Пополнить баланс'}</span>
                  </button>

                  {/* Selected Method Info */}
                  <div className="text-center text-xs text-gray-500 pt-2">
                    Оплата через: <span className="text-gray-300 font-medium">{selectedPaymentMethod?.name || 'Не выбрано'}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Subscription Tab */
            <>
              {/* Mobile/Tablet Version */}
              <div className="block lg:hidden space-y-4 sm:space-y-6">
              {/* Title */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Выберите VIP статус</h3>
                <p className="text-xs sm:text-sm text-gray-400">Получите эксклюзивные привилегии и бонусы</p>
              </div>

              {/* Subscription Tiers Grid */}
              <div className="grid grid-cols-1 gap-3">
                {subscriptionTiers.map((tier) => {
                  const isPro = tier.id === 2;
                  const isPremium = tier.id === 3;
                  const isSelected = selectedSubscription === tier.id;

                  return (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedSubscription(tier.id)}
                      className={`
                        relative rounded-lg border transition-all overflow-hidden text-left
                        ${isSelected
                          ? 'bg-gray-800 border-white shadow-lg shadow-white/10'
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                        }
                      `}
                    >
                      {/* Most Popular Badge */}
                      {isPro && (
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded text-[9px] sm:text-[10px] font-bold text-white uppercase shadow-lg flex items-center gap-1">
                          <ExchangeIcon className="w-3 h-3" /> Популярный
                        </div>
                      )}

                      {/* Check Mark */}
                      {isSelected && (
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      <div className="p-3 sm:p-4">
                        {/* Top Section */}
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          {/* Icon */}
                          <div className="p-2 rounded-lg bg-gray-700 flex-shrink-0">
                            <img
                              src={isPremium ? '/images/status++.png' : isPro ? '/images/status+.png' : '/images/status.png'}
                              alt={tier.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-1">
                              <h3 className="text-lg sm:text-xl font-bold text-white">{tier.name}</h3>
                              <span className="text-[10px] sm:text-xs text-gray-400">30 дней</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-white">
                              <Monetary value={tier.price} />
                            </div>
                          </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-900/60 rounded-lg p-2 sm:p-2.5 border border-gray-700/50">
                            <div className="text-[9px] sm:text-[10px] text-gray-400 mb-1">Бонус к дропу</div>
                            <div className="text-sm sm:text-base font-bold text-green-400">+{tier.bonus_percentage}%</div>
                          </div>
                          <div className="bg-gray-900/60 rounded-lg p-2 sm:p-2.5 border border-gray-700/50">
                            <div className="text-[9px] sm:text-[10px] text-gray-400 mb-1 truncate">
                              {isPremium ? 'Дубликаты' : 'Кейсов'}
                            </div>
                            <div className="text-sm sm:text-base font-bold text-blue-400">
                              {isPremium ? '✗' : tier.max_daily_cases}
                            </div>
                          </div>
                          <div className="bg-gray-900/60 rounded-lg p-2 sm:p-2.5 border border-gray-700/50">
                            <div className="text-[9px] sm:text-[10px] text-gray-400 mb-1">VIP чат</div>
                            <div className="text-sm sm:text-base font-bold text-purple-400"><ReceivedIcon className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                          </div>
                        </div>

                        {/* Additional Features */}
                        <div className="mt-3 pt-3 border-t border-gray-700/50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] sm:text-xs">
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <span className="text-green-400"><ReceivedIcon className="w-3 h-3 sm:w-4 sm:h-4" /></span>
                              <span>VIP иконка</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <span className="text-green-400"><ReceivedIcon className="w-3 h-3 sm:w-4 sm:h-4" /></span>
                              <span>Приоритет в поддержке</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <span className="text-green-400"><ReceivedIcon className="w-3 h-3 sm:w-4 sm:h-4" /></span>
                              <span>Бесплатный кейс</span>
                            </div>
                            {isPremium && (
                              <div className="flex items-center gap-1.5 text-gray-300">
                                <span className="text-green-400"><ReceivedIcon className="w-3 h-3 sm:w-4 sm:h-4" /></span>
                                <span>Без дубликатов</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Info Block */}
              <div className="text-sm text-gray-300 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-3 sm:p-4 border border-gray-700/30 flex items-start gap-2 sm:gap-3">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1.5 text-xs sm:text-sm">Преимущества VIP статуса</p>
                  <ul className="text-gray-400 space-y-1 text-[10px] sm:text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Повышенный шанс выпадения редких предметов из кейсов</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Ежедневный бесплатный кейс (автоматически начисляется)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Уникальная VIP иконка в профиле и чате</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Приоритетная поддержка 24/7</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Purchase Section */}
              {selectedSubscription && (
                <div className="bg-gray-800/40 rounded-lg p-3 sm:p-4 border border-gray-700/30 space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                      <Crown className="text-yellow-500" />
                      Подтверждение покупки
                    </h3>
                  </div>

                  {/* Selected Tier Summary */}
                  <div className="bg-gray-900/70 border border-gray-700/50 rounded-lg p-3">
                    {(() => {
                      const selectedTier = subscriptionTiers.find(t => t.id === selectedSubscription);
                      if (!selectedTier) return null;

                      const isPremium = selectedTier.id === 3;
                      const isPro = selectedTier.id === 2;

                      return (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-gray-700">
                              <img
                                src={isPremium ? '/images/status++.png' : isPro ? '/images/status+.png' : '/images/status.png'}
                                alt={selectedTier.name}
                                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                              />
                            </div>
                            <div>
                              <div className="text-sm sm:text-base font-semibold text-white">{selectedTier.name}</div>
                              <div className="text-[10px] sm:text-xs text-gray-400">30 дней подписки</div>
                            </div>
                          </div>
                          <div className="text-lg sm:text-xl font-bold text-white">
                            <Monetary value={selectedTier.price} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>


                  {/* Purchase Button */}
                  <button
                    onClick={() => handleSubscriptionPurchase(selectedSubscription)}
                    disabled={isSubscriptionLoading}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
                  >
                    <Crown className="text-base sm:text-lg" />
                    <span>{isSubscriptionLoading ? 'Создание платежа...' : 'Купить VIP статус'}</span>
                  </button>
                </div>
              )}
            </div>

              {/* Desktop Version */}
              <div className="hidden lg:grid lg:grid-cols-[1fr_380px] gap-6">
                {/* Left Side - Subscription Tiers */}
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Выберите VIP статус</h3>
                    <p className="text-sm text-gray-400">Получите эксклюзивные привилегии и бонусы</p>
                  </div>

                  {/* Subscription Tiers Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {subscriptionTiers.map((tier) => {
                      const isPro = tier.id === 2;
                      const isPremium = tier.id === 3;
                      const isSelected = selectedSubscription === tier.id;

                      return (
                        <button
                          key={tier.id}
                          onClick={() => setSelectedSubscription(tier.id)}
                          className={`
                            relative rounded-lg border transition-colors overflow-hidden text-left
                            ${isSelected
                              ? 'bg-gray-800 border-white'
                              : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                            }
                          `}
                        >
                          {/* Most Popular Badge */}
                          {isPro && (
                            <div className="absolute top-3 right-3 px-2.5 py-1 bg-gray-700 rounded text-[10px] font-medium text-gray-300 uppercase">
                              Популярный
                            </div>
                          )}

                          {/* Check Mark */}
                          {isSelected && (
                            <div className="absolute top-3 left-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}

                          <div className="p-4 flex items-center gap-4">
                            {/* Icon */}
                            <div className="p-2 rounded-lg bg-gray-700 flex-shrink-0">
                              <img
                                src={isPremium ? '/images/status++.png' : isPro ? '/images/status+.png' : '/images/status.png'}
                                alt={tier.name}
                                className="w-12 h-12 object-contain"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-1.5">
                                <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                                <span className="text-xs text-gray-400">30 дней</span>
                              </div>

                              {/* Features Grid */}
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-gray-900/40 rounded-lg p-2">
                                  <div className="text-[10px] text-gray-400 mb-0.5">Бонус к дропу</div>
                                  <div className="text-base font-semibold text-white">+{tier.bonus_percentage}%</div>
                                </div>
                                <div className="bg-gray-900/40 rounded-lg p-2">
                                  <div className="text-[10px] text-gray-400 mb-0.5">
                                    {isPremium ? 'Без дубликатов' : 'Кейсов в день'}
                                  </div>
                                  <div className="text-base font-semibold text-white">
                                    {isPremium ? <ReceivedIcon className="w-4 h-4" /> : tier.max_daily_cases}
                                  </div>
                                </div>
                                <div className="bg-gray-900/40 rounded-lg p-2">
                                  <div className="text-[10px] text-gray-400 mb-0.5">VIP чат</div>
                                  <div className="text-base font-semibold text-white"><ReceivedIcon className="w-5 h-5" /></div>
                                </div>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="flex-shrink-0 text-right">
                              <div className="text-2xl font-semibold text-white mb-1">
                                <Monetary value={tier.price} />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Info Text */}
                  <div className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 border border-gray-700/30 flex items-start gap-2">
                    <Crown className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white mb-1 text-sm">Преимущества VIP статуса</p>
                      <ul className="text-gray-400 space-y-0.5 text-xs">
                        <li>• Повышенный шанс выпадения редких предметов из кейсов</li>
                        <li>• Ежедневный бесплатный кейс (автоматически начисляется)</li>
                        <li>• Уникальная VIP иконка в профиле и чате</li>
                        <li>• Приоритетная поддержка</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right Side - Purchase Summary */}
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30 space-y-4 h-fit sticky top-0">
                  {selectedSubscription ? (
                    <>
                      {/* Selected Tier Preview */}
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <Crown />
                          Выбранный статус
                        </label>
                        <div className="bg-gray-900/70 border border-gray-700/50 rounded-lg p-3">
                          {(() => {
                            const selectedTier = subscriptionTiers.find(t => t.id === selectedSubscription);
                            if (!selectedTier) return null;

                            const isPremium = selectedTier.id === 3;
                            const isPro = selectedTier.id === 2;

                            return (
                              <>
                                <div className="flex items-center gap-2.5 mb-3">
                                  <div className="p-2 rounded-lg bg-gray-700">
                                    <img
                                      src={isPremium ? '/images/status++.png' : isPro ? '/images/status+.png' : '/images/status.png'}
                                      alt={selectedTier.name}
                                      className="w-10 h-10 object-contain"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-lg font-semibold text-white">{selectedTier.name}</div>
                                    <div className="text-xs text-gray-400">30 дней подписки</div>
                                  </div>
                                </div>

                                {/* Benefits List */}
                                <div className="space-y-1.5 mb-3">
                                  <div className="flex items-start gap-2 text-xs">
                                    <ReceivedIcon className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                                    <span className="text-gray-300">
                                      Бонус <span className="font-semibold text-white">+{selectedTier.bonus_percentage}%</span> к шансу выпадения
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-xs">
                                    <ReceivedIcon className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                                    <span className="text-gray-300">
                                      {isPremium ? 'Предметы выпадают без дубликатов' : 'Доступ ко всем бонусам'}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-xs">
                                    <ReceivedIcon className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                                    <span className="text-gray-300">VIP значок в профиле и чате</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-xs">
                                    <ReceivedIcon className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                                    <span className="text-gray-300">Приоритетная поддержка</span>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-700/50"></div>

                      {/* Purchase Button */}
                      <button
                        onClick={() => handleSubscriptionPurchase(selectedSubscription)}
                        disabled={isSubscriptionLoading}
                        className="w-full py-3 bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Crown className="text-base" />
                        <span>{isSubscriptionLoading ? 'Создание платежа...' : 'Купить статус'}</span>
                      </button>

                    </>
                  ) : (
                    /* No Selection State */
                    <div className="flex items-center justify-center min-h-[400px]">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-lg bg-gray-800 flex items-center justify-center">
                          <img
                            src="/images/status+.png"
                            alt="VIP статус"
                            className="w-16 h-16 object-contain opacity-50"
                          />
                        </div>
                        <p className="text-gray-400 text-sm">
                          Выберите VIP статус<br />для продолжения
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DepositModal;
