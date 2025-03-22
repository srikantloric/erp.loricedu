import { Breadcrumbs, Typography } from '@mui/material'
import GrainIcon from "@mui/icons-material/Grain";
import { Link } from 'react-router-dom';

type BreadcrumProps = {
  Icon: any;
  Path: string;
  ActionBtn:any;
};

function BreadCrumbsV3({Icon,Path,ActionBtn}:BreadcrumProps) {
   
    const breadCrumbPath:Array<string> = Path.split("/");

  return (
    <div
            style={{
              backgroundColor: "var(--bs-gray-201)",
              padding: "10px",
              borderRadius: "5px",
              justifyContent:"space-between",
              display: "flex",
            }}
          >
            <Breadcrumbs aria-label="breadcrumb">

              {breadCrumbPath.map((item,key)=>{

                if(key==0){
                  return(
                   <Link to="/" style={{
                      textDecoration: "none",
                      color: "#343a40",
                      display: "flex",
                      alignItems: "center",
                    }}>
                    <Icon  sx={{ color: "var(--bs-gray-500)" }}/>
                    <Typography sx={{ ml: "4px" }}>
                      {item}
                    </Typography>
                    </Link>
                  )
                }else if(key == breadCrumbPath.length-1){
                  return(
                  <Typography
                  sx={{ display: "flex", alignItems: "center" }}
                  color="text.secondary"
                >
                  <GrainIcon sx={{ mr: 0.3 }} fontSize="inherit" />
                 {item}
                </Typography>
                  )
                }else{
                  return(
                    <Typography
                    sx={{ display: "flex", alignItems: "center" }}
                    color="text.secondary"
                  >
                    {item}
                  </Typography>  
                  ) 
                }
              })}
                
            </Breadcrumbs>
            <ActionBtn/>
          </div>
  )
}

export default BreadCrumbsV3