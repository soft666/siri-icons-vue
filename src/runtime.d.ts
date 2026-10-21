import type { DefineComponent, SVGAttributes } from 'vue';

/** SVG attributes/events are forwarded to the outer <svg>. */
export interface IconProps extends SVGAttributes {
  /** Width and height. Default: 24. Use "1em" to follow font size. */
  size?: number | string;
  /** Sets currentColor for monochrome icons. Default: "currentColor". */
  color?: string;
  /** Adds an accessible SVG title. Omit for decorative icons. */
  title?: string;
}

export type IconComponent = DefineComponent<IconProps>;
export type SvgNode = string | readonly [
  tag: string,
  attributes: Readonly<Record<string, string>>,
  children: readonly SvgNode[],
];

export interface IconDefinition {
  attributes: Readonly<Record<string, string>>;
  children: readonly SvgNode[];
  ids: readonly string[];
}

/** @internal Generated icon modules use this shared runtime. */
export declare function createIcon(name: string, definition: IconDefinition): IconComponent;

export type IllustrationProps = Omit<IconProps,'color'>;
export type IllustrationComponent = DefineComponent<IllustrationProps>;
export declare function createIllustration(name: string, definition: IconDefinition): IllustrationComponent;

import type { ImgHTMLAttributes } from 'vue';
export interface DoodleProps extends ImgHTMLAttributes {
  size?: number | string;
  title?: string;
}
export type DoodleComponent = DefineComponent<DoodleProps>;
export declare function createDoodle(name:string,src:string):DoodleComponent;
