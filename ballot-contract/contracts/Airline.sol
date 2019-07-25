pragma solidity ^0.5.0;

contract Consortium {

    address chairperson;

    mapping (address => int) public air_data;
    mapping (address => int) public Balance;

    constructor () public {
        chairperson = msg.sender;
        register(chairperson, 1);
    }

   modifier onlyChair(){
   require(msg.sender ==chairperson);
   _;
}


    function register(address user, int airline_id) public {
        air_data[user] = airline_id;
    }

    function unregister(address user) public onlyChair{
        air_data[user] = 0;
    }

    function balanceDetails () public returns(int){
	if(Balance[msg.sender] >=0){
		return air_data[msg.sender];
	} else{
		return -1;	
	}

    }

    function settle_payment(int airline_id) private {
        air_data[msg.sender] = airline_id;
     }

     // Airlines response to user's request by doing validation and settle payment if it's good
     function response(int airline_requested) public {
	if(Balance[msg.sender]<0){
		revert();	
	}
        updateAirlines(airline_requested);
     }

    function updateAirlines(int256 airline) public{
        if(air_data[msg.sender]==airline){
            revert();
        } else{
            air_data[msg.sender] = airline;
        }
    }
    
}
