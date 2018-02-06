// Generated by N4JS transpiler; for copyright see original N4JS source file.

(function(System) {
	'use strict';
	System.register([
		'org.eclipse.n4js.mangelhaft/src-gen/org/eclipse/n4js/mangelhaft/types/ITestReporter',
		'org.eclipse.n4js.mangelhaft/src-gen/org/eclipse/n4js/mangelhaft/types/TestSpy'
	], function($n4Export) {
		var ITestReporter, TestSpy, IDEReporter;
		IDEReporter = function IDEReporter(endpoint, timeoutBufferOverride) {
			this.endpointValue = "MISSING_REQUIRED_ENDPOINT";
			this.timeoutBuffer = 1000 * 30;
			this.fetch = fetch;
			this.spy = undefined;
			ITestReporter.$fieldInit.call(this, undefined, {
				endpointValue: undefined,
				timeoutBuffer: undefined,
				fetch: undefined,
				spy: undefined,
				endpoint: undefined
			});
			if (endpoint) {
				this.endpoint = endpoint.replace(/\/+$/, "");
			}
			if (timeoutBufferOverride !== undefined) {
				this.timeoutBuffer = timeoutBufferOverride;
			}
		};
		$n4Export('IDEReporter', IDEReporter);
		return {
			setters: [
				function($_import_org_u002feclipse_u002fn4js_u002fmangelhaft_u002ftypes_u002fITestReporter) {
					ITestReporter = $_import_org_u002feclipse_u002fn4js_u002fmangelhaft_u002ftypes_u002fITestReporter.ITestReporter;
				},
				function($_import_org_u002feclipse_u002fn4js_u002fmangelhaft_u002ftypes_u002fTestSpy) {
					TestSpy = $_import_org_u002feclipse_u002fn4js_u002fmangelhaft_u002ftypes_u002fTestSpy.TestSpy;
				}
			],
			execute: function() {
				$makeClass(IDEReporter, N4Object, [
					ITestReporter
				], {
					send: {
						value: async function send___n4(uri, method, headers, body) {
							let ret, bodyStr;
							try {
								bodyStr = JSON.stringify(body, (key, value)=>{
									if (key === "description") {
										value = undefined;
									}
									return value;
								}, 2);
								ret = await Promise.resolve(this.fetch.call(null, this.endpoint + uri, {
									method: method,
									headers: headers,
									body: bodyStr
								}));
							} catch(er) {
								let err = er;
								console.error(err);
								console.error(err.stack);
							}
							if (ret) {
								if (Math.floor(ret.status / 100) != 2) {
									console.error("STATUS:", ret.status, ret.statusText, uri);
									if (bodyStr) {
										console.error("BODY:" + bodyStr);
									}
								}
							}
							return ret;
						}
					},
					register: {
						value: async function register___n4() {
							let that = this, sessionId = null, inParameterized = false;
							;
							var handleTestingStart = async function handleTestingStart(numAllGroups, sid, numAllTests) {
								sessionId = sid;
								let response = await that.send([
									"/n4js/testing/sessions",
									sessionId,
									"start"
								].join("/"), 'POST', {
									'Content-Type': "application/vnd.n4js.start_session_req.tm+json",
									Accept: "application/json"
								}, undefined);
								return response;
							};
							this.spy.testingStarted.add(handleTestingStart);
							this.spy.parameterizedGroupsStarted.add((test)=>inParameterized = true);
							var handleTestStart = async function handleTestStart(groupName, testName, timeout) {
								if (inParameterized) {
									return;
								}
								if (!sessionId) {
									throw new Error("Test start sent before session start");
								}
								await that.send([
									"/n4js/testing/sessions",
									sessionId,
									"tests",
									IDEReporter.escapeGroupName(groupName) + "%23" + testName,
									"start"
								].join("/"), 'POST', {
									'Content-Type': "application/vnd.n4js.start_test_req.tm+json",
									Accept: "application/json"
								}, {
									timeout: timeout + that.timeoutBuffer
								});
							};
							this.spy.testStarted.add(async(group, test)=>{
								await handleTestStart(group.name, test.name, test.timeout);
							});
							var handleTestFinished = async function handleTestFinished(groupName, testName, testResult) {
								if (inParameterized) {
									return;
								}
								if (!sessionId) {
									throw new Error("Test end sent outside active session");
								}
								await that.send([
									"/n4js/testing/sessions",
									sessionId,
									"tests",
									IDEReporter.escapeGroupName(groupName) + "%23" + testName,
									"end"
								].join("/"), 'POST', {
									'Content-Type': "application/vnd.n4js.end_test_req.tm+json",
									Accept: "application/json"
								}, testResult);
							};
							this.spy.testFinished.add(async(group, test, testResult)=>{
								await handleTestFinished(group.name, test.name, testResult);
							});
							this.spy.parameterizedGroupsFinished.add(async(resultGroups)=>{
								inParameterized = false;
								let resultGroup = resultGroups.aggregate();
								for(let testResult of resultGroup.testResults) {
									await handleTestStart(resultGroup.description, testResult.description, 100);
									await handleTestFinished(resultGroup.description, testResult.description, testResult);
								}
							});
							var handleTestingFinished = async function handleTestingFinished(resultGroups) {
								let response = await that.send([
									"/n4js/testing/sessions",
									sessionId,
									"end"
								].join("/"), 'POST', {
									'Content-Type': "application/vnd.n4js.end_session_req.tm+json",
									Accept: "application/json"
								}, undefined);
								return response;
							};
							this.spy.testingFinished.add(handleTestingFinished);
							return this;
						}
					},
					endpoint: {
						get: function getEndpoint___n4() {
							return this.endpointValue;
						},
						set: function setEndpoint___n4(endpoint) {
							this.endpointValue = endpoint.replace(/\/+$/, "");
						}
					},
					endpointValue: {
						value: undefined,
						writable: true
					},
					timeoutBuffer: {
						value: undefined,
						writable: true
					},
					fetch: {
						value: undefined,
						writable: true
					},
					spy: {
						value: undefined,
						writable: true
					}
				}, {
					escapeGroupName: {
						value: function escapeGroupName___n4(groupName) {
							return groupName.replace(/\//g, "%2F");
						}
					}
				}, function(instanceProto, staticProto) {
					var metaClass = new N4Class({
						name: 'IDEReporter',
						origin: 'org.eclipse.n4js.mangelhaft.reporter.ide',
						fqn: 'org.eclipse.n4js.mangelhaft.reporter.ide.IDEReporter.IDEReporter',
						n4superType: N4Object.n4type,
						allImplementedInterfaces: [
							'org.eclipse.n4js.mangelhaft.types.ITestReporter.ITestReporter'
						],
						ownedMembers: [
							new N4DataField({
								name: 'endpointValue',
								isStatic: false,
								annotations: []
							}),
							new N4Accessor({
								name: 'endpoint',
								getter: true,
								isStatic: false,
								annotations: []
							}),
							new N4Accessor({
								name: 'endpoint',
								getter: false,
								isStatic: false,
								annotations: []
							}),
							new N4DataField({
								name: 'timeoutBuffer',
								isStatic: false,
								annotations: []
							}),
							new N4DataField({
								name: 'fetch',
								isStatic: false,
								annotations: []
							}),
							new N4DataField({
								name: 'spy',
								isStatic: false,
								annotations: [
									new N4Annotation({
										name: 'Inject',
										details: []
									})
								]
							}),
							new N4Method({
								name: 'send',
								isStatic: false,
								jsFunction: instanceProto['send'],
								annotations: []
							}),
							new N4Method({
								name: 'constructor',
								isStatic: false,
								jsFunction: instanceProto['constructor'],
								annotations: []
							}),
							new N4Method({
								name: 'register',
								isStatic: false,
								jsFunction: instanceProto['register'],
								annotations: []
							}),
							new N4Method({
								name: 'escapeGroupName',
								isStatic: true,
								jsFunction: staticProto['escapeGroupName'],
								annotations: []
							})
						],
						consumedMembers: [],
						annotations: []
					});
					return metaClass;
				});
				Object.defineProperty(IDEReporter, '$di', {
					value: {
						fieldsInjectedTypes: [
							{
								name: 'spy',
								type: TestSpy
							}
						]
					}
				});
			}
		};
	});
})(typeof module !== 'undefined' && module.exports ? require('n4js-node/src-gen/index').System(require, module) : System);
//# sourceMappingURL=IDEReporter.map