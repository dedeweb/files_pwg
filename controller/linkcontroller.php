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

namespace OCA\Files_Pwg\Controller;

use \OCP\IRequest;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\AppFramework\Http\DataResponse;
use \OCP\AppFramework\Controller;
use \OCP\IServerContainer;
use \OCP\IL10N;

class LinkController extends Controller {
	//private $userId;
	private $l;
	private $storage;
	private $piwigoDir;

	public function __construct($AppName, IRequest $request, IL10N $l, $UserFolder){
		parent::__construct($AppName, $request);
		$this->storage = $UserFolder;
		$this->l = $l;
		$this->piwigoDir = '/var/www/piwigo/galleries/albums/';
	}
	/**
	 * lie le répertoire à piwigo. 
	 * @param string $filename - nom du fichier source
	 * @param string $linkname - nom du lien cible
	 * @param string $dirname - nom du répertoire source
	 * @NoAdminRequired
	 */
	public function index($filename, $linkname, $dirname){
		if(empty($filename) || empty($linkname) || empty($dirname)){
			return array("status"=>"error","message"=>$this->l->t('Erreur de paramètres.'));
		}
		$msg =array();
		//$msg[] = "coucou";

		$dir = \OC\Files\Filesystem::getLocalFolder($dirname)."/".$filename;

		if(is_link($this->piwigoDir.$linkname)) {
			$msg[] = "Erreur : le lien existe déja ( ".$this->piwigoDir.$linkname. ")";
			
		} else {
			if(!symlink($dir, $this->piwigoDir.$linkname))
			{
				$msg[] = "Erreur lors de la création du lien : ".$this->piwigoDir.$linkname."->".$dir;
			}	
		}
		
		
		
		
		
		$msg = implode("<br>\n",$msg);
		$status = (empty($msg)?'success':'error');
		$result = array('status'=>$status,'name'=>$srcFile,'message'=>$msg);
		return $result;

	}
  
  public function deleteLink($linkname) {
    if(is_link($this->piwigoDir.$linkname)) {
      unlink($this->piwigoDir.$linkname);
      return array('status'=>'success');
    }
    return array('status'=>'error');
  }

	public function listLinks()
	{
		$resultList = array();
		$msg = "Request successfully executed";
		$status = "success";
		if(is_dir($this->piwigoDir))
		{
			if ($dh = opendir($this->piwigoDir)) {
				while (($file = readdir($dh)) !== false) {
					if($file != "..") {
						//echo "fichier : $file : type : " . filetype($dir . $file) . "\n";
						if(is_link($this->piwigoDir.$file))
						{
							array_push($resultList, array('file' => $file, 'link' =>  basename(readlink($this->piwigoDir.$file))));	
						}
					}
				}
				closedir($dh);
			}
			else
			{
				$msg = "Cannot open dir ".$this->piwigoDir;
				$status = "error";
			}
		}
		return  array('status'=>$status,'message'=>$msg, 'links' => $resultList);
	}

	/**
	 * copy object recursively, $src can be either file or folder, it doesn't matter
	 * @param string $src - sourcefile
	 * @param string $dest - destination file
	 * @deprecated supported natively now by OC8
	 */
	/*
	private function copyRec($src,$dest){
		if(\OC\Files\Filesystem::is_dir($src)){ // copy dir
			if($dh = \OC\Files\Filesystem::opendir($src)){
				\OC\Files\Filesystem::mkdir($dest);
				while(($file = readdir($dh)) !== false){
					if(in_array($file,array('.','..'))) continue; // skip links to self or upper folder
					if(\OC\Files\Filesystem::is_dir($src.'/'.$file)) $this->copyRec($src.'/'.$file,$dest.'/'.$file);
					else \OC\Files\Filesystem::copy($src.'/'.$file, $dest.'/'.$file);
				}
			}
		}
		else{ // copy file
			\OC\Files\Filesystem::copy($src, $dest);
		}
		return true;
	}
*/
}

