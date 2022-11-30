/******************************************************************************
 * Copyright 2022 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

 import { AstNode, Reference } from "langium";

export interface TypeNodeBase {
    kind: "object" | "array" | "string" | "boolean" | "number" | "reference";
  }
  export interface SimpleType extends TypeNodeBase {
    kind: "object";
    $type: string;
    properties: PropertyNode[];
  }
  export interface ReferenceType extends TypeNodeBase {
    kind: "reference";
    $text: string;
    type: SimpleType;
  }
  export type PrimitiveMapping = {
    string: string;
    boolean: boolean;
    number: number;
  };
  export interface PrimitiveType<T extends "number" | "string" | "boolean">
    extends TypeNodeBase {
    kind: T;
    value: PrimitiveMapping[T];
  }
  
  export interface ArrayType extends TypeNodeBase {
    kind: "array";
    children: TypeNode[];
  }
  
  export type TypeNode =
    | SimpleType
    | ArrayType
    | PrimitiveType<"boolean">
    | PrimitiveType<"number">
    | PrimitiveType<"string">
    | ReferenceType;
  
  export interface PropertyNode {
    name: string;
    type: TypeNode;
  }
  
  export function preprocessAstNode(node: AstNode): SimpleType {
    const properties: PropertyNode[] = Object.keys(node)
      .filter((n) => !n.startsWith("$"))
      .map((n) => {
        const valueOrValues = node[n] as
          | AstNode
          | AstNode[]
          | "string"
          | "number"
          | "boolean"
          | Reference;
        if (Array.isArray(valueOrValues)) {
          return {
            name: n,
            type: preprocessArrayType(valueOrValues),
          } as PropertyNode;
        } else if (typeof valueOrValues === "object") {
          if ("$refText" in valueOrValues) {
            return {
              name: n,
              type: preprocessReferenceNode(valueOrValues),
            } as PropertyNode;
          }
          return {
            name: n,
            type: preprocessAstNode(valueOrValues),
          } as PropertyNode;
        } else if (typeof valueOrValues === "string") {
          return {
            name: n,
            type: {
              kind: "string",
              value: valueOrValues,
            },
          } as PropertyNode;
        } else if (typeof valueOrValues === "number") {
          return {
            name: n,
            type: {
              kind: "number",
              value: valueOrValues,
            },
          } as PropertyNode;
        } else {
          return {
            name: n,
            type: {
              kind: "boolean",
              value: valueOrValues,
            },
          } as PropertyNode;
        }
      });
    return {
      kind: "object",
      $type: node.$type,
      properties,
    };
  }
  
  export function preprocessReferenceNode(
    node: Reference<AstNode>
  ): ReferenceType {
    return {
      kind: "reference",
      $text: node.$refText,
      type: preprocessAstNode(node.ref!),
    };
  }
  
  export function preprocessArrayType(nodes: AstNode[]): ArrayType {
    const children = nodes.map(preprocessAstNode);
    return {
      kind: "array",
      children,
    };
  }
  