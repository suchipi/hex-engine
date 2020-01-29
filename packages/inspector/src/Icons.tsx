import React from "react";

export function PaneRightIcon({
  width = 16,
  height = 16,
}: {
  width?: number | string | undefined;
  height?: number | string | undefined;
} = {}) {
  /* This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  return (
    <svg viewBox="0 0 16 16" width={width} height={height}>
      <path
        fill="currentColor"
        d="M4 3H2v10h2V3zM8 6v4l3-2-3-2z"
        fillOpacity=".3"
      />
      <path
        fill="currentColor"
        d="M7.53 10.88A1 1 0 0 1 7 10V6a1 1 0 0 1 1.55-.83l3 2a1 1 0 0 1 0 1.66l-3 2a1 1 0 0 1-1.02.05zM11 8L8 6v4l3-2zM2 2h12c.6 0 1 .4 1 1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V3c0-.6.4-1 1-1zm12 11V3H5v10h9zM2 13h2V3H2v10z"
      />
    </svg>
  );
}

export function PaneLeftIcon({
  width = 16,
  height = 16,
}: {
  width?: number | string | undefined;
  height?: number | string | undefined;
} = {}) {
  /* This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  return (
    <svg viewBox="0 0 16 16" width={width} height={height}>
      <path
        fill="currentColor"
        d="M4 3H2v10h2V3zm7 7V6L8 8l3 2z"
        fillOpacity=".3"
      />
      <path
        fill="currentColor"
        d="M11.47 10.88A1 1 0 0 0 12 10V6a1 1 0 0 0-1.55-.83l-3 2a1 1 0 0 0 0 1.66l3 2c.3.2.7.23 1.02.05zM8 8l3-2v4L8 8zM2 2h12c.6 0 1 .4 1 1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V3c0-.6.4-1 1-1zm12 11V3H5v10h9zM2 13h2V3H2v10z"
      />
    </svg>
  );
}

export function PauseIcon({
  width = 16,
  height = 16,
}: {
  width?: number | string | undefined;
  height?: number | string | undefined;
} = {}) {
  /* This Source Code Form is subject to the terms of the Mozilla Public
 - License, v. 2.0. If a copy of the MPL was not distributed with this
 - file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  return (
    <svg viewBox="0 0 16 16" width={width} height={height}>
      <path
        fill="currentColor"
        d="M5,13.5C5,13.8,4.7,14,4.5,14C4.2,14,4,13.8,4,13.5V2.6c0-0.3,0.2-0.5,0.5-0.5C4.7,2.1,5,2.3,5,2.6V13.5z"
      />
      <path
        fill="currentColor"
        d="M11.9,13.5c0,0.3-0.2,0.5-0.5,0.5s-0.5-0.2-0.5-0.5V2.6c0-0.3,0.2-0.5,0.5-0.5s0.5,0.2,0.5,0.5V13.5z"
      />
    </svg>
  );
}

export function ResumeIcon({
  width = 16,
  height = 16,
}: {
  width?: number | string | undefined;
  height?: number | string | undefined;
} = {}) {
  /* This Source Code Form is subject to the terms of the Mozilla Public
 - License, v. 2.0. If a copy of the MPL was not distributed with this
 - file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  return (
    <svg viewBox="0 0 16 16" width={width} height={height}>
      <path
        fill="currentColor"
        d="M5 3v10l7-5-7-5zM4 3c0-.81.92-1.31 1.58-.84l7 5.03a1 1 0 0 1 0 1.62l-7 5.03C4.92 14.31 4 13.81 4 13V3z"
      />
    </svg>
  );
}

export function StepIcon({
  width = 16,
  height = 16,
}: {
  width?: number | string | undefined;
  height?: number | string | undefined;
} = {}) {
  /* This Source Code Form is subject to the terms of the Mozilla Public
 - License, v. 2.0. If a copy of the MPL was not distributed with this
 - file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  return (
    <svg viewBox="0 0 16 16" width={width} height={height}>
      <g fillRule="evenodd">
        <path
          fill="currentColor"
          d="M13.297 6.912C12.595 4.39 10.167 2.5 7.398 2.5A5.898 5.898 0 0 0 1.5 8.398a.5.5 0 0 0 1 0A4.898 4.898 0 0 1 7.398 3.5c2.75 0 5.102 2.236 5.102 4.898v.004L8.669 7.029a.5.5 0 0 0-.338.942l4.462 1.598a.5.5 0 0 0 .651-.34.506.506 0 0 0 .02-.043l2-5a.5.5 0 1 0-.928-.372l-1.24 3.098z"
        />
        <circle fill="currentColor" cx="7" cy="12" r="1" />
      </g>
    </svg>
  );
}
