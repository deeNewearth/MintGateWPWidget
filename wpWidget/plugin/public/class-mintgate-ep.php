<?php

class Mintgate_Verifier_Ep {

	private $logger;

	public function __construct( $logger ) {
		$this->logger = $logger;
	}

    /**
	 * Registers Rest API endpoint
	 *
	 * @since    1.0.0
	*/
	public function register_api(){

		/*
		register_rest_route( 'ne-mintgate/v1', '/wallet/(?P<id>\d+)', array(
			'methods' => 'GET',
			'callback' => array($this,'checkWallet'),
		  ) );
		*/

		register_rest_route( 'ne-mintgate/v1', '/wallet', array(
			'methods' => 'POST',
			'callback' => array($this,'checkWallet'),
		) );

		register_rest_route( 'ne-mintgate/v1', '/content/(?P<id>.+)', array(
			'methods' => 'GET',
			'callback' => array($this,'getContent'),
		) );

        register_rest_route( 'ne-mintgate/v1', '/signout', array(
			'methods' => 'GET',
			'callback' => array($this,'signOut'),
		) );

	}

    public function signOut(WP_REST_Request $request ) {

        if (session_id()) {
            require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-wallet-data.php';
            
            $_SESSION['wallet']=null;
            $wallet =  WalletData::fromSession();
        }

        return rest_ensure_response("done"); 
    }


    public function getContent(WP_REST_Request $request ) {
		//xdebug_break();

        $return = array(
            "status"=>"error"
        );
		try
		{
			$postId = $request->get_param('id');
			
			if(strlen($postId) == 0){
				throw new Exception('no postId found');
			}

			require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-wallet-data.php';
			$wallet =  WalletData::fromSession();

            if(isset($wallet) && isset($wallet->nounce)){
                $return["nounce"] = $wallet->nounce;
            }

            if(! (isset($wallet) && isset($wallet->address) && strlen($wallet->address) > 0) ){
                $return["status"] = "notInit";
                return rest_ensure_response($return);    
            }

            $return["address"] = $wallet->address;

            $options = get_option( 'ne_mintgate_plugin_options' );

            if (strlen($options['api_key']) == 0 ){
                throw new Exception('api key is not set');
            }

            $tokenId = get_post_meta( $postId, 'mintgate_meta_link_value_key', true );

            if (strlen($tokenId) == 0 ){
                //it should never be here
                throw new Exception('token id is not set');
            }

            /*
            {
            "status": "fail",
            "message": "no matching token ID found"
            }
            {
            "status": "success",
            "passed": false,
            "tid": "MXU6DPSWB6EP",
            "wallet": "0x16b45979a753b8df8859A5bF0B2F179Fa80BA2C9"
            }
            {
            "status": "success",
            "passed": true,
            "tid": "MXU6DPSWB6EP",
            "wallet": "0x1CB2A831F7Ba048826248AFB6F7Ae6222C1fe1C1"
            }
            */

            $access = Mintgate_Verifier_Ep::jsonGet("https://mgate.io/api/v2/sdk/tokencheck",
                array(
                    "jwt" => $options['api_key'],
                    "tid" => $tokenId,
                    "wallet" => $wallet->address
                )
                
            );

            if(!isset($access)){
                throw new Exception('Failed connecting to verification service');
            }
            
            if($access->status != "success"){
                $message = $access->message;
                if(strlen($message) == 0){
                    $message = "failed to get token information";
                }

                throw new Exception($message);
            }

            if($access->passed != true){
                $return["status"] = "noaccess";
                return rest_ensure_response($return);    
            }else{

                $content = get_the_content( null, false, $postId);
    
                $content = apply_filters( 'the_content', $content );


                $return["status"] = "success";
                $return["content"] = $content;
                return rest_ensure_response($return);    
            }

		}
		catch(Exception $e) {
            $return["status"] = "error";
            $return["error"] = $e->getMessage();
			return rest_ensure_response($return);
		}
	}

	//availbale at http://localhost:56395/?rest_route=/ne-mintgate/v1/wallet/1

	public function checkWallet(WP_REST_Request $request ) {
		// You can access parameters via direct array access on the object:
		
		//xdebug_break();

		try
		{
			$signed = $request->get_param( 'signed' );

			if(strlen($signed) == 0){
				throw new Exception('no signature found');
			}
			
			require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-wallet-data.php';
			$wallet =  WalletData::fromSession();

			if(!isset($wallet) || strlen($wallet->nounce) == 0  ){
				throw new Exception('no wallet nounce found');
			}

			$checkUrl = getenv("WALLETCHECK_URL");
			if(strlen($checkUrl) == 0){
				$checkUrl = "https://walletcheck.newearthart.tech";
			}

			$this->logger->logInfo("using checkUrl ".$checkUrl);

			//$json = json_decode(file_get_contents("http://server.com/json.php"));

			$results = $this->jsonPost($checkUrl."/check",array(
				"signed" => $signed,
				"nounce" => $wallet->nounce
			));

			if(!isset($results) || strlen($results->address) == 0  ){
				throw new Exception('failed to determine wallet address');
			}

			$wallet->address = $results->address;
			$_SESSION['wallet'] = serialize($wallet);

			return rest_ensure_response(array(
				"status"=>"done",
				"address"=>$wallet->address
			));

		}
		catch(Exception $e) {

			return rest_ensure_response(array(
				"status"=>"error",
				"error"=>$e->getMessage()
			));
		}
		
	}

    private function jsonPost(string $url,array $data){

		//xdebug_break();

		$ch = curl_init($url);
		
		/* Setup request to send json via POST
		$data = array(
			'username' => 'codexworld',
			'password' => '123456'
		);
		*/

		$payload = json_encode($data);
		
		curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		
		$result = curl_exec($ch);

		if(false === $result){
			$this->logger->logError('Curl post failed ['.strval(curl_errno($ch)). "] - error ->".curl_error($ch));
		}

		curl_close($ch);

		if(false === $result){
			return null;
		}

		return json_decode($result);
	}

    static private function jsonGet(string $url,array $params){

		//xdebug_break();

		$ch = curl_init($url);
		
		/* Setup request to send json via GET
		$data = array(
			'username' => 'codexworld',
			'password' => '123456'
		);
		*/

        $firstParam = true;
		foreach ($params as $key => $value){
            if($firstParam){
                $url.="?";
                $firstParam = false;
            }else{
                $url.="&";
            }
            
            $url.=($key."=".urlencode($value));
        }

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));

        $result = curl_exec($ch);
		curl_close($ch);

		return json_decode($result);
		
	}


}

?>