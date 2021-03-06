/**
 * Copyright (c) 2019 NumberFour AG.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   NumberFour AG - Initial API and implementation
 */
package org.eclipse.n4js.cli;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import org.eclipse.n4js.N4JSGlobals;
import org.eclipse.n4js.cli.N4jscOptions.GoalRequirements;

import com.google.common.base.Strings;

/**
 * Validates the given n4jsc.jar options
 */
public class N4jscOptionsValidater {

	/** Entry function for validator */
	static public N4jscExitCode validate(N4jscOptions options) throws N4jscException {

		validateGoalDefinitions(options);

		switch (options.getGoal()) {
		case version:
			// User asked for version. Don't bother him.
			break;

		case help:
			// User asked for help. Don't bother him.
			break;

		case lsp:
			validateGoalLspOptions(options);
			break;

		case clean:
			validateGoalCleanOptions(options);
			break;

		case compile:
			validateGoalCompileOptions(options);
			break;

		case api:
			break;

		case watch:
			break;
		}

		return N4jscExitCode.SUCCESS;
	}

	private static void validateGoalLspOptions(N4jscOptions options) throws N4jscException {
		if (options.getPort() < 1 || options.getPort() > 65535) {
			String msg = "Port is out of range: " + options.getPort();
			throw new N4jscException(N4jscExitCode.OPTION_INVALID, msg);
		}

		if (options.getExec() != null && options.isStdio()) {
			String msg = "Option --exec may not be combined with --stdio.";
			throw new N4jscException(N4jscExitCode.OPTION_INVALID, msg);
		}

		if (!options.getDirs().isEmpty()) {
			String msg = "Goal LSP does not expect superfluous directory argument";
			throw new N4jscException(N4jscExitCode.ARGUMENT_DIRS_INVALID, msg);
		}
	}

	private static void validateGoalCleanOptions(N4jscOptions options) throws N4jscException {
		validateFilesAndDirectories(options);
	}

	private static void validateGoalCompileOptions(N4jscOptions options) throws N4jscException {
		validateFilesAndDirectories(options);

		if (options.isDefinedPerformanceOption()) {
			validatePerformanceOptions(options);
		}
	}

	private static void validateGoalDefinitions(N4jscOptions options) throws N4jscException {
		Map<String, GoalRequirements> nameFieldMap = options.getOptionNameToGoalRequirementMap();

		for (String name : options.getDefinedOptions().keySet()) {
			if (nameFieldMap.containsKey(name)) {
				GoalRequirements goalRequirements = nameFieldMap.get(name);
				List<N4jscGoal> goals = Arrays.asList(goalRequirements.goals());
				boolean optionGoalRequirementMet = goals.contains(options.getGoal());
				if (!optionGoalRequirementMet) {
					List<String> goalNames = goals.stream().map(g -> g.name()).collect(Collectors.toList());
					String msg = "Given option " + name + " requires goal(s) " + String.join(", ", goalNames) //
							+ ", but goal " + options.getGoal() + " was given.";
					throw new N4jscException(N4jscExitCode.OPTION_INVALID, msg);
				}
			}
		}
	}

	/** Make sure the srcFiles are valid */
	private static void validateFilesAndDirectories(N4jscOptions options) throws N4jscException {
		if (options.getDirs().isEmpty()) {
			String msg = "n4js directory(s) missing";
			throw new N4jscException(N4jscExitCode.ARGUMENT_DIRS_INVALID, msg);
		}
		if (options.getDirs().size() > 1) {
			String msg = "Multiple project directories not supported.";
			throw new N4jscException(N4jscExitCode.ARGUMENT_DIRS_INVALID, msg);
		}

		StringJoiner notExisting = new StringJoiner(",");
		StringJoiner neitherFileNorDir = new StringJoiner(",");
		for (File dir : options.getDirs()) {
			if (!dir.exists()) {
				notExisting.add(dir.toString());
			} else if (dir.isDirectory()) {
				continue;
			} else if (dir.isFile() && N4JSGlobals.PACKAGE_JSON.equals(dir.getName())) {
				continue;
			} else {
				neitherFileNorDir.add(dir.toString());
			}
		}
		if (!notExisting.toString().isEmpty()) {
			String msg = "directory(s) do not exist: " + notExisting.toString();
			throw new N4jscException(N4jscExitCode.ARGUMENT_DIRS_INVALID, msg);
		}
		if (!neitherFileNorDir.toString().isEmpty()) {
			String msg = "directory(s) are neither directory nor a package.json file: " + neitherFileNorDir.toString();
			throw new N4jscException(N4jscExitCode.ARGUMENT_DIRS_INVALID, msg);
		}
	}

	private static void validatePerformanceOptions(N4jscOptions options) throws N4jscException {
		if (options.getPerformanceReport() == null) {
			String msg = "Missing performance report.";
			throw new N4jscException(N4jscExitCode.OPTION_INVALID, msg);
		}
		if (Strings.isNullOrEmpty(options.getPerformanceKey())) {
			String msg = "Missing performance key.";
			throw new N4jscException(N4jscExitCode.OPTION_INVALID, msg);
		}
		if ("*".equals(options.getPerformanceKey()) && options.getPerformanceReport().getName().endsWith(".csv")) {
			String msg = "Asterisk as performance key not supported when exporting to CSV format.";
			throw new N4jscException(N4jscExitCode.OPTION_INVALID, msg);
		}
	}
}
