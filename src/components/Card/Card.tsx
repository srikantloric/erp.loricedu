import { useState } from "react";
import Styles from "./Cards.module.scss";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FacultyType } from "types/facuities";
// import LOGO from "../../assets/logotransparent.png";



interface CardProps {
  facultyData: FacultyType;
}

function Card({ facultyData }: CardProps) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const FacultyDetail = (data: string | number) => {
    navigate(`/Faculties/${data}`);
  };

  const handleImageOnLoad = () => {
    setImageLoaded(true);
  };

  return (
    <>
      <div className={Styles.cardContainer}>
        <div className={Styles.cardHeader}>
          <div
            className={Styles.blurLoading}
            style={{
              backgroundImage: `url(${facultyData.facultyImageThumb})`,
            }}
          >
            <img
              className={`${Styles.facultyImage} ${imageLoaded && Styles.loaded}`}
              src={facultyData.facultyImage}
              loading="lazy"
              onLoad={handleImageOnLoad}
              alt="facultyImage"
            />
          </div>

          {facultyData.isFromManagement && imageLoaded ? (
            <img className={Styles.badge} alt="badge" />
          ) : null}
        </div>
        <div className={Styles.cardBody}>
          <h3>{facultyData.facultyName}</h3>
          <p>{facultyData.facultySpecification}</p>
        </div>
        <div className={Styles.cardFooter}>
          <Button
            className={Styles.viewButton}
            variant="contained"
            disableElevation
            onClick={() => {
              FacultyDetail(facultyData.id!);
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </>
  );
}
export default Card;
