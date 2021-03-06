<?php
/**
 * ownCloud - files_mv
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author eotryx <mhfiedler@gmx.de>
 * @copyright eotryx 2015
 */

namespace OCA\Files_Pwg\AppInfo;

/*\OCP\Util::addScript( 'files_mv', "move" );
\OCP\Util::addStyle('files_mv', 'mv');*/

$eventDispatcher = \OC::$server->getEventDispatcher();
$eventDispatcher->addListener(
	'OCA\Files::loadAdditionalScripts',
	function() {
		\OCP\Util::addScript( 'files_pwg', 'link' );
		\OCP\Util::addScript( 'files_pwg', 'piwigoTabView' );
	}
);

\OCP\Util::addStyle('files_pwg', 'pwg');

