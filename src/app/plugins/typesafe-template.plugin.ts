import * as babel from '@babel/core';
import { NodePath } from '@babel/traverse';
import { ImportDeclaration, JSXElement, Program } from '@babel/types';

import { Handler, handlers } from '../handlers';
import { getJSXElementName } from '../helpers';


export interface TypesafeTemplateOptions {
	data: object;
}

export interface State {
	opts: TypesafeTemplateOptions;
}

export function TypesafeTemplatePlugin(context: typeof babel) {
	const visitor = {
		Program(path: NodePath<Program>, state: State) {
			path.setData('$data', state.opts.data);
			path.setData('$parent', undefined);
			path.setData('$root', state.opts.data);
		},
		ImportDeclaration(path: NodePath<ImportDeclaration>, state: State) {
			/* Removes imports from this library in templates. */

			if (path.node.source.value === 'typesafe-templates') {
				path.remove();
			}
		},
		JSXElement(path: NodePath<JSXElement>, state: State) {
			const name = getJSXElementName(path);

			if (!handlers.has(name)) {
				return;
			}

			const handler = handlers.get(name) as Handler;
			handler(path, state);

			return;
		}
	};

	return { visitor } as babel.PluginObj;
}
