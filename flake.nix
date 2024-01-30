{
	inputs = {
		nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.11";
		flake-utils.url = "github:numtide/flake-utils";
	};

	outputs =
		{ self, nixpkgs, flake-utils }:
		
		flake-utils.lib.eachDefaultSystem (system:
			with import nixpkgs { inherit system; };
			with lib;
			with builtins;

			{
				packages.default = buildGoModule rec {
					name = "nasmfmt-wasm";
					src = ./.;
					vendorHash = "sha256-57YBppgOZjMgjuqdTsqpw8LbfCtqby3HBWcl+p0bn3U=";
					subPackages = [ "./cmd/nasmfmt-wasm" ];
					doCheck = false;
					nativeBuildInputs = [ tinygo deno ];

					buildPhase = ''
						export TINYGOFLAGS="--no-debug" # prevent GOROOT in binary
						export HOME=$TMPDIR
						make
					'';

					installFiles = [
						"index.html"
						"nasmfmt.wasm"
						"script.js"
						"style.css"
					];

					installPhase = ''
						mkdir -p $out
						cp ${concatStringsSep " " installFiles} $out
					'';
				};

				devShell = mkShell {
					packages = [
						tinygo
						gopls
						deno
						nodePackages.prettier

						(writeShellScriptBin "file_server" ''
							exec deno run \
								--allow-net \
								--allow-read \
								https://deno.land/std/http/file_server.ts "$@"
						'')
					];

					GOOS = "js";
					GOARCH = "wasm";
				};
			}
		);
}
