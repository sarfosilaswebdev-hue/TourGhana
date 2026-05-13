declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.png' {
  const value: any;
  export default value;
}