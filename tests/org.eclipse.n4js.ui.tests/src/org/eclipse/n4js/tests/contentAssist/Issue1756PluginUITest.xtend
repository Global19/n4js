/**
 * Copyright (c) 2020 NumberFour AG.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   NumberFour AG - Initial API and implementation
 */
package org.eclipse.n4js.tests.contentAssist

import org.junit.Test

/**
 *
 */
class Issue1756PluginUITest extends AbstractN4JSContentAssistPluginUITest {

	@Test def void test_01() throws Exception {
		newBuilder().append('''
			let value;
			
			export function foo(): any {
			    return (arg) => {
			        let x = async () => {
			            value = new C((p: Object) => {
			            	someFun<|>
			            });
			            return null;
			        };
				}
			}
			
			class C {
				constructor(f: Function) {}
			}
			
			function someFunctionWithAnExtremelyLooooongName() {}
		'''
		).assertProposalAtCursor('someFunctionWithAnExtremelyLooooongName');
	}
	
}