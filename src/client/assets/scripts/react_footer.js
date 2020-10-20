import React from 'react';
import ReactDOM from 'react-dom';


class Game extends React.Component {
    render() {
        return (
            <div className="footer_flex_inner_one">
                        <div className="footer_flex_inner_one_left">
                            <span>Doctor</span>
    
                            <span>Hospital</span>
    
                            <span>Treatment</span>
    
                            <span>Other Services</span>
    
                            <span>FAQs</span>
    
                        </div>
    
                        <img src="https://s3.ap-south-1.amazonaws.com/appdev.konfinity.com/css/tasks/footer.png" />
    
                    </div>
    
                    <div className="footer_flex_inner_two">
                        <span className="footer_end">All Rights Reserved. © tvastra 2018</span>
                        <span><i className="fab fa-facebook-f"></i> &nbsp;&nbsp;&nbsp;&nbsp; <i className="fab fa-pinterest-p"></i>
                            &nbsp;&nbsp;&nbsp;&nbsp; <i className="fab fa-twitter"></i> &nbsp;&nbsp;&nbsp;&nbsp; <i
                                className="fab fa-google-plus-g"></i> &nbsp;&nbsp;&nbsp;&nbsp; <i
                                className="fab fa-instagram"></i></span>
                    </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('footer_flex_tab_laptop')
);
