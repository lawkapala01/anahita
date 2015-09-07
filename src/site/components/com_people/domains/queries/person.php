<?php

/**
 * Person Query.
 *
 * @category   Anahita
 *
 * @author     Rastin Mehr <rastin@anahitapolis.com>
 * @license    GNU GPLv3 <http://www.gnu.org/licenses/gpl-3.0.html>
 *
 * @link       http://www.GetAnahita.com
 */
class ComPeopleDomainQueryPerson extends AnDomainQueryDefault
{
    /**
     * Build the filter query.
     */
    protected function _beforeQuerySelect()
    {
        $viewer = get_viewer();

        if ($this->filter_usertype && $viewer->admin()) {
            $this->where('person.person_usertype', '=', $this->filter_usertype);
        }

        if ($this->filter_email && $viewer->admin()) {
            $this->where('person.person_useremail', '=', $this->filter_email);
        } else {
            $subclause = $this->clause();

            if ($this->filter_username) {
                $subclause->where('person.person_username', 'LIKE', '%'.$this->filter_username.'%');
            }

            if ($this->keyword) {
                $subclause->where('person.name', 'LIKE', '%'.$this->keyword.'%', 'OR');
            }
        }

        if ($this->filter_disabled_accounts && $viewer->admin()) {
            $this->where('person.enabled', '=', 0);
        }

        $this->order('updateTime', 'DESC');
    }
}
