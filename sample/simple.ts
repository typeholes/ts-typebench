
type N = { n: number };

type A = string;

export type B = { b: A };

export type C = {
   s: 'A';
   b: bigint;
};

type Foo = Array<string>;

type Bar = string[];

type Constructor = 'hmm';

type Cons = Constructor;