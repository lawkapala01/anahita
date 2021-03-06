<?php

/**
 * Connect Login Contorller.
 *
 * @category   Anahita
 *
 * @author     Arash Sanieyan <ash@anahitapolis.com>
 * @author     Rastin Mehr <rastin@anahitapolis.com>
 * @license    GNU GPLv3 <http://www.gnu.org/licenses/gpl-3.0.html>
 *
 * @link       http://www.GetAnahita.com
 */
class ComConnectControllerLogin extends ComBaseControllerResource
{
    /**
     * Initializes the options for the object.
     *
     * Called from {@link __construct()} as a first step of object instantiation.
     *
     * @param 	object 	An optional KConfig object with configuration options.
     */
    protected function _initialize(KConfig $config)
    {
        $config->append(array(
            'behaviors' => array(
                'oauthorizable',
                'validatable',
            ),
        ));

        parent::_initialize($config);
    }

    /**
     * After getting the access token store the token in the session and redirect.
     *
     * @param AnCommandContext $context Context parameter
     * @param void
     */ 
    protected function _actionGetaccesstoken($context)
    {
        $this->getBehavior('oauthorizable')->execute('action.getaccesstoken', $context);
        
        if ($token = $this->getAPI()->getToken()) {
            $context->response->setRedirect('view=login');
            return true;
        }
        
        $context->response->setRedirect(route('option=com_people&view=session'));
    }

    /**
     * Redners the login form.
     */
    protected function _actionRead(AnCommandContext $context)
    {
        if (!$this->getAPI()) {
            $context->response->setRedirect(route('option=com_people&view=session'));
            return false;
        }
        
        $service = $this->getAPI()->getName();
        $profileId = $this->getAPI()->getUser()->id;
        $token = $this->getService('repos:connect.session')
                      ->find(array(
                          'profileId' => $profileId, 
                          'api' => $service
                      ));
                      
        $return_url = AnRequest::get('session.return', 'raw');

        if ($token) {
            $person = $token->owner;
            AnRequest::set('session.oauth', null);

            $credentials = array(
                'username' => $person->username,
                'password' => get_hash('COM_CONNECT_PASSWORD')
            );

            if ($this->getService('com:people.helper.person')->login($credentials)) {
                $context->response->setRedirect(base64_decode($return_url));
            }

            return false;
        }

        $this->return_url = base64_encode($return_url);
    }
}
