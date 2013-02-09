<?php

$path = __DIR__ . '/../../..';

if ( getenv( 'MW_INSTALL_PATH' ) !== false ) {
	$path = getenv( 'MW_INSTALL_PATH' );
}

require_once( $path . '/maintenance/Maintenance.php' );

class MakeStaticLoader extends Maintenance {

	public function __construct() {
		parent::__construct();

			$this->addOption( 'target', 'Which target to use ("demo" or "test"). Default: false', false, true );
			$this->addOption( 'indent', 'Indentation prefix to use (number of tabs or a string)', false, true );
			$this->addOption( 've-path', 'Override path to "/modules/". Default by --target', false, true );
			$this->addOption( 'section', 'head, body or both', false, true );
	}

	public function execute() {
		global $wgResourceModules, $wgHtml5, $wgWellFormedXml;

		$wgHtml5 = true;
		$wgWellFormedXml = false;

		$section = $this->getOption( 'section', 'both' );
		$target = $this->getOption( 'target', 'demo' );
		$indent = $this->getOption( 'indent', 2 );
		if ( is_numeric( $indent ) ) {
			$indent = str_repeat( "\t", $indent );
		}
		// Path to /modules/
		$vePath = $this->getOption( 've-path',
			$target === 'demo'
			// From /demos/ve/index.php
			? '../../modules/'
			// From /modules/ve/test/index.html
			: '../../'
		);

		$wgResourceModules['Dependencies'] = array(
			'scripts' => array(
				'jquery/jquery.js',
				'rangy/rangy-core.js',
				'rangy/rangy-position.js',
			),
		);

		$wgResourceModules['Standalone Init'] = array(
			'styles' => array(
				've/init/sa/styles/ve.init.sa.css',
			),
			'scripts' => array(
				've/init/sa/ve.init.sa.js',
				've/init/sa/ve.init.sa.Platform.js',
			),
			'headAdd' => '
		<script>
			if ( window.devicePixelRatio > 1 ) {
				document.write( \'<link rel="stylesheet" href="' . $vePath . 've/ui/styles/ve.ui.Icons-vector.css">\' );
			} else {
				document.write( \'<link rel="stylesheet" href="' . $vePath . 've/ui/styles/ve.ui.Icons-raster.css">\' );
			}
		</script>',
			'bodyAdd' => '<script>
	<?php
		require( \'' . $vePath . '../VisualEditor.i18n.php\' );
		echo \'ve.init.platform.addMessages( \' . json_encode( $messages[\'en\'] ) . \');\' . "\n";
	?>
	ve.init.platform.setModulesUrl( \'' . $vePath . '\' );
</script>'
		);

		$self = isset( $_SERVER['PHP_SELF'] ) ? $_SERVER['PHP_SELF'] :  ( lcfirst( __CLASS__ ) . '.php' );

		$head = $body = "";

		$modules = array(
			'Dependencies',
			'ext.visualEditor.base',
			'Standalone Init',
			'ext.visualEditor.core',
		);
		foreach ( $modules as $module ) {
			if ( !isset( $wgResourceModules[$module] ) ) {
				echo "\nError: File group $module\n not found!\n";
				exit( 1 );
			}
			$registry = $wgResourceModules[$module];

			$headAdd = $bodyAdd = '';

			if ( isset( $registry['styles'] ) && $target !== 'test' ){
				foreach ($registry['styles'] as $style) {
					$headAdd .= $indent . Html::element( 'link', array( 'rel' => 'stylesheet', 'href' => "$vePath$style" ) ) . "\n";
				}
			}
			if ( isset( $registry['scripts'] ) ) {
				foreach ($registry['scripts'] as $script) {
					$bodyAdd .= $indent . Html::element( 'script', array( 'src' => "$vePath$script" ) ) . "\n";
				}
			}
			if ( isset( $registry['debugScripts'] ) ) {
				foreach ($registry['debugScripts'] as $script) {
					$bodyAdd .= $indent . Html::element( 'script', array( 'src' => "$vePath$script" ) ) . "\n";
				}
			}
			if ( isset( $registry['headAdd'] ) ) {
				$headAdd .= $indent . implode( "\n$indent", explode( "\n", $registry['headAdd'] ) ) . "\n";
			}
			if ( isset( $registry['bodyAdd'] ) ) {
				$bodyAdd .= $indent . implode( "\n$indent", explode( "\n", $registry['bodyAdd'] ) ) . "\n";
			}

			if ( $headAdd ) {
				$head .= "$indent<!-- $module -->\n$headAdd";
			}
			if ( $bodyAdd ) {
				$body .= "$indent<!-- $module -->\n$bodyAdd";
			}
		}
		if ( $head ) {
			if ( $section === 'both' ) {
				echo "<head>\n\n$indent<!-- Generated by $self -->\n$head\n\n</head>";
			} elseif ( $section === 'head' ) {
				echo $head;
			}
		}
		if ( $body ) {
			if ( $section === 'both' ) {
				echo "<body>\n\n$indent<!-- Generated by $self -->\n$body\n\n</body>\n";
			} elseif ( $section === 'body' ) {
				echo $body;
			}
		}
	}
}

$maintClass = 'MakeStaticLoader';
require_once( RUN_MAINTENANCE_IF_MAIN );
