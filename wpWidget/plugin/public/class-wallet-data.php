<?php

class WalletData{

    //Used to verify that wallet ownership
    public $nounce ="";
    
    //verified public address
    public $address ="";

    public static function fromSession(){

        if (!session_id()) {
            return null;
        }

        if(array_key_exists('wallet',$_SESSION)){
            $serData = $_SESSION['wallet'];

            if(isset($serData) && strlen($serData) > 0){
                return unserialize($serData);
            }

        }

        //there is no session wallet create new one
        $wallet = WalletData::newNounce(); 
        $_SESSION['wallet'] = serialize($wallet);

        return $wallet;
        
    }


    public static function newNounce(){
        $newData = new WalletData();
        $newData->nounce = "Please sign to verify wallet ownership - ".WalletData::random_str();
        return $newData;
    }

        /**
     * Generate a random string, using a cryptographically secure 
     * pseudorandom number generator (random_int)
     *
     * This function uses type hints now (PHP 7+ only), but it was originally
     * written for PHP 5 as well.
     * 
     * For PHP 7, random_int is a PHP core function
     * For PHP 5.x, depends on https://github.com/paragonie/random_compat
     * 
     * @param int $length      How many characters do we want?
     * @param string $keyspace A string of all possible characters
     *                         to select from
     * @return string
     */
    static function random_str(
        int $length = 10,
        string $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    ): string {
        if ($length < 1) {
            throw new \RangeException("Length must be a positive integer");
        }
        $pieces = [];
        $max = mb_strlen($keyspace, '8bit') - 1;
        for ($i = 0; $i < $length; ++$i) {
            $pieces []= $keyspace[random_int(0, $max)];
        }
        return implode('', $pieces);
    }



}

?>