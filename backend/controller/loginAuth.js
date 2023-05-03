const qs = require("qs")
const axios = require("axios")

const login = async (req, res) => {

    try{
        let data = qs.stringify({

            client_id:
              "978594592448-joc3dcnc5mnl082uo9sl2tmrev212rka.apps.googleusercontent.com",
            client_secret: "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",
            refresh_token:
              "1//04goin8nyZsY1CgYIARAAGAQSNwF-L9IrSGGiQfqSiMH8qwCdDajAONvhymbk3M4lDCv2AJMEv9TpzHfE8hJw3YWvjArJ1qUb2U0",
            grant_type: "refresh_token"
          });
        
          let config = {
        
            method: "post",
            url: "https://accounts.google.com/o/oauth2/token",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            data: data,
          };
                
          const accessData = await axios(config)
        
          if(accessData?.data?.error_description == 'Unauthorized' ){
            return res.status(401).json({
                success : false,
                message : "User is UnAuthorized , Please Login"
            })
          }
          
          res.cookie("accessToken" , accessData.data.access_token)

          res.status(200).json({
            success: true,
            message: "Login SuccessFully",
          });

    }catch(err){
        return res.status(500).json({
            status : false ,
            message : err.message
        })
    }
};

module.exports =  login ;
