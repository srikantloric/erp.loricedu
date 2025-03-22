import { Breadcrumbs, Typography } from '@mui/material'
import GrainIcon from "@mui/icons-material/Grain";
import { Link } from 'react-router-dom';

type BreadcrumProps = {
  Icon: any;
  Path: string;
};

function BreadCrumbsV2({Icon,Path}:BreadcrumProps) {
   
    const breadCrumbPath:Array<string> = Path.split("/");

  return (
    <div
            style={{
              backgroundColor: "var(--bs-gray-201)",
              padding: "10px",
              borderRadius: "5px",
              display: "flex",
            }}
          >
            <Breadcrumbs aria-label="breadcrumb">
              {breadCrumbPath.map((item,key)=>{
                if(key==0){
                  return(
                    <Link to="/" key={key} style={{
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
                  key={key}
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
                    key={key}
                    sx={{ display: "flex", alignItems: "center" }}
                    color="text.secondary"
                  >
                    {item}
                  </Typography>  
                  ) 
                }
              })}
                
            </Breadcrumbs>
          </div>
  )
}

export default BreadCrumbsV2