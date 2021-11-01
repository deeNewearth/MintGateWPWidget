<?php

class DockerLogger{

    private $log_level;
    //info=0, warn=1, error =2

    public function __construct( ) {

		$evnLevel = getenv("LOG_LEVEL");
			
        if(strlen($evnLevel) == 0){
            $evnLevel = "1";
		}

        $log_level = intval($evnLevel, 10); // 

	}

    private function LogIt($level, $message){
        error_log(" ******** NE Mintgate Verifier ************** ".$level." :  --- ". $message);
    }
    
    public function logInfo($message){
        if($this->log_level <= 0){
            $this->LogIt("info",$message);
        }
    }

    public function logWarn($message){
        if($this->log_level <= 1){
            $this->LogIt("warn",$message);
        }
    }

    public function logError($message){
        if($this->log_level <= 2){
            $this->LogIt("error",$message);
        }
    }

}

?>