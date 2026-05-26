declare module "react-simple-maps" {
  import { ReactNode, CSSProperties, SVGProps } from "react";

  export interface ProjectionConfig {
    scale?: number;
    center?: [number, number];
    rotate?: [number, number, number];
    parallels?: [number, number];
  }

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: Geography[]; projection: unknown }) => ReactNode;
  }

  export interface Geography {
    rsmKey: string;
    id: string | number;
    type: string;
    properties: Record<string, unknown>;
    geometry: object;
  }

  export interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: Geography;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: Record<string, unknown>;
      hover?: Record<string, unknown>;
      pressed?: Record<string, unknown>;
    };
  }

  export interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
    className?: string;
  }

  export interface SphereProps extends SVGProps<SVGPathElement> {
    id: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  }

  export interface GraticuleProps extends SVGProps<SVGPathElement> {
    stroke?: string;
    strokeWidth?: number;
    step?: [number, number];
  }

  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    children?: ReactNode;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const Marker: React.FC<MarkerProps>;
  export const Sphere: React.FC<SphereProps>;
  export const Graticule: React.FC<GraticuleProps>;
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;
}
