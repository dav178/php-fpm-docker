<?
	/******************************
	*  Data Management class for PHP  *
	*  Copyright (c) 2008 Emile Néron *
	******************************/

	class dbMng {
		var $_dbServer;
		var $_dbDatabase;
		var $_dbUsername;
		var $_dbPassword;
		var $_dbDebug;
		var $_dbHistory;
		var $_errStyle = "border:3px solid red;padding:10px;background-color:#ffeacc;font-family:arial;font-size:12px;font-weight:bold";
		var $_link;
		var $_transon = 0;

		/*
		function dbMng() { // PHP 4 constructor
			$argcv = func_get_args(); call_user_func_array(array(&$this, '__construct'), $argcv); // Set constructor for php 4
			register_shutdown_function(array(&$this, '__destruct')); // Set destructor for php 4
		}
		*/

		function __construct($dbServer,$dbDatabase,$dbUsername,$dbPassword,$dbDebug,$dbHistory) {
			$this->_dbServer = $dbServer;
			$this->_dbDatabase = $dbDatabase;
			$this->_dbUsername = $dbUsername;
			$this->_dbPassword = $dbPassword;
			$this->_dbDebug = $dbDebug;
			$this->_dbHistory = $dbHistory;
		}

		function connect() {
			if(!is_resource($this->_link)) {
				$this->_link = mysqli_connect($this->_dbServer, $this->_dbUsername, $this->_dbPassword);
				mysqli_select_db($this->_link, $this->_dbDatabase);
			}
			mysqli_query($this->_link, "SET NAMES UTF8");
		}

		function setDebug($val){
			$this->_dbDebug=$val; // Enable manual set
		}

		function showerror($strSql) {
			echo("<div style='".$this->_errStyle."'>".mysqli_errno($this->_link)." : ".mysqli_error($this->_link)."<br/>[".$strSql."]</div>");
			/*
			if($this->_dbDebug>0) {
				echo("<div style='".$this->_errStyle."'>".mysqli_errno($this->_link)." : ".mysqli_error($this->_link)."<br/>[".$strSql."]</div>");
			} else {
				if($_SERVER['SERVER_NAME']=="localhost") {
					$errpage = "../../";
				} else {
					$errpage = "http://".$_SERVER['SERVER_NAME']."/";
				}
				echo("<script language='javascript'>document.location='".$errpage."unavailable.php?notno=".mysqli_errno($this->_link)."';</script>");
			}
			*/
		}

		function transaction(){
			$this->connect();
			$this->_transon=1;
			mysqli_query($this->_link, "BEGIN");
		}

		function commit(){
			$this->_transon=0;
			mysqli_query($this->_link, "COMMIT");
		}

		function rollback(){
			$this->_transon=0;
			mysqli_query($this->_link, "ROLLBACK");
		}

		function select($strSql) {
			$this->connect();
			if($this->_dbDebug==2){echo($strSql."<br/>");}
			$result = mysqli_query($this->_link, $strSql) or die($this->showerror($strSql));
			$matrix=array();
			$i=0;
			while ($row = mysqli_fetch_array($result)) {
				array_push($matrix,array());
				$matrix[$i]=$row;
				$i++;
			}
			mysqli_free_result($result);
			return $matrix;
		}

		function query($strSql) {
			$this->connect();
			if($this->_dbDebug==2){echo($strSql."<br/>");}
			if($this->_dbHistory==1) {
				mysqli_query($this->_link, "INSERT INTO web_history_raw (action_date,action_sql,id_account,ip_adress) VALUES('".date("Y-m-d H:i:s")."','".addslashes($strSql)."',".sanitize_int($_SESSION['id_account']).",'".$_SERVER['REMOTE_ADDR']."')");
			}
			if($this->_transon==0){
				$result = mysqli_query($this->_link, $strSql) or die($this->showerror($strSql));
			} else {
				$result = mysqli_query($this->_link, $strSql);
				if($result==false){
					throw new Exception (sprintf ("MySQL|%d|%s|%s", mysqli_errno ($this->_link), mysqli_error ($this->_link), $strSql));
				}
			}
			return $result;
		}

		function mulquery($arrSql) {
			$this->connect();
			for($i=0;$i<count((array)$arrSql);$i++) {
				if($this->_dbDebug==2){echo($arrSql[$i]."<br/>");}
				if($this->_dbHistory==1) {
					mysqli_query($this->_link,"INSERT INTO web_history_raw (action_date,action_sql,id_account,ip_adress) VALUES('".date("Y-m-d H:i:s")."','".addslashes($arrSql[$i])."',".sanitize_int($_SESSION['id_account']).",'".$_SERVER['REMOTE_ADDR']."')");
				}
				if($this->_transon==0){
					$result = mysqli_query($this->_link, $arrSql[$i]) or die($this->showerror($arrSql[$i]));
				} else {
					$result = mysqli_query($this->_link, $arrSql[$i]);
					if($result==false){
						throw new Exception (sprintf ("MySQL|%d|%s|%s", mysqli_errno ($this->_link), mysqli_error ($this->_link), $arrSql[$i]));
					}
				}
			}
			return $result;
		}

		function getlastid() {
			$this->connect();
			$lastid = mysqli_insert_id($this->_link);
			return $lastid;
		}

		function showprocesses() {
			$this->connect();
			$result = mysqli_list_processes($this->_link);
			echo("<div style='".$this->_errStyle."'>");
			while ($row = mysqli_fetch_assoc($result)){
				echo("PROC_ID: ".$row["Id"]."---HOST: ".$row["Host"]."---DB: ".$row["db"]."---COMMAND: ".$row["Command"]."---TIME: ".$row["Time"]."<br/>");
			}
			echo("</div>");
			mysqli_free_result($result);
		}

		function __destruct(){
			if(is_resource($this->_link)) {
				mysqli_close($this->_link);
			}
		}
	}
?>
