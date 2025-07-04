import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export default function CustomDialog({
                                         open,
                                         modalImg,
                                         onClose,
                                         children,
                                         title,
                                         closeButton= true,
                                         handleContinue,
                                         showCancelButton = true,
                                         continueButtonText = "Continue",
                                         cancelButtonText = "Cancel",
                                         customImgClass,


                                     }) {



    return (
        <div>

            <Dialog
                sx={{width:"100%", display:"flex", justifyContent:"center",
                    "& .MuiDialog-container": {
                        // alignItems: "center",
                        // justifyContent: "center",
                    },
                    "& .MuiDialog-paper": {
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        // alignItems: "center",
                        // justifyContent: "center",
                    },
                }}

                PaperProps={{
                    sx: {
                        // position: "relative",
                        padding: "35px",
                        display:"flex",
                        justifyContent:"center",
                        backgroundColor: "#ffd6e0",
                        // maxWidth:"1000px",
                        margin:0,
                        height: 300,
                        overflow: "hidden",
                        borderRadius: "20px",
                    }
                }}
                open={open}
                onClose={onClose}  // Allows clicking outside to close the dialog
                aria-labelledby="dialog-title"
                aria-describedby="dialog-description"
                // sx={{ // Custom styles
                //     "& .MuiDialog-paper": {
                //         padding: 15,
                //         borderRadius: 5,
                //         backgroundColor: "#f9f9f9", // Background color for dialog
                //     }
                // }}
            >
                    <div className={"modal-header"}>
                        { closeButton &&
                            <div onClick={onClose} className={"close-button"}>
                                &times;
                            </div>
                        }
                        <img  src={modalImg} alt={"Search image"} className={customImgClass?customImgClass:"girl-search"}/>

                    </div>



                <DialogTitle id="dialog-title" className={"dialogue-title"}
                             sx={{fontSize: "1.5rem",textTransform:"capitalize", fontWeight: "bold", padding:0}}>
                    {title}

                </DialogTitle>
                {children &&  <DialogContent sx={{padding:0, display:"flex", justifyContent:"center"}}>
                    {/*<DialogContentText className={"dialogue-title"} id="dialog-description"*/}
                    {/*                   sx={{marginBottom: 2, textTransform: "uppercase"}}>*/}
                    {/* ~{contentText}~*/}
                    {/*</DialogContentText>*/}

                    {children}
                </DialogContent> }

                <DialogActions sx={{width:"100%", display:"flex", justifyContent:`${showCancelButton? "space-between":"center"}`}}>
                    {showCancelButton && (
                        <Button onClick={onClose} className={"cancel-modal"} sx={{borderRadius:"15px",backgroundColor:"deeppink", width:"50%", height:"50px", color:"white"}}>
                            {cancelButtonText}
                        </Button>
                    )}
                    <Button onClick={handleContinue} className={"continue-modal"}   sx={{borderRadius:"15px", justifyContent:"center",  width:!showCancelButton?"100%":"50%", display:"flex", backgroundColor:"#ffd6e0", height:"50px", color:"deeppink", border: "1px solid"}} >
                        {continueButtonText}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>

    );
}
